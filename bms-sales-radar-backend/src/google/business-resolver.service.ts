import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import {
  GooglePlace,
  ResolvedBusinessMatch,
} from './interfaces/google-place.interface';

interface GoogleTextSearchResponse {
  places?: GooglePlace[];
}

@Injectable()
export class BusinessResolverService {
  private readonly logger = new Logger(
    BusinessResolverService.name,
  );

  private readonly apiUrl =
    'https://places.googleapis.com/v1/places:searchText';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async resolveBusiness(
    title: string,
    instagramUrl: string,
    snippet?: string,
  ): Promise<ResolvedBusinessMatch[]> {
    const apiKey =
      this.configService.getOrThrow<string>(
        'GOOGLE_API_KEY',
      );

    const username =
      this.extractInstagramUsername(
        instagramUrl,
        `${title} ${snippet ?? ''}`,
      );

    const cleanedTitle =
      this.cleanTitle(title);

    const textQuery = [
      username,
      cleanedTitle,
      'İstanbul',
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 250);

    if (!username && !cleanedTitle) {
      throw new BadRequestException(
        'İşletme araması için yeterli bilgi bulunamadı.',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<GoogleTextSearchResponse>(
          this.apiUrl,
          {
            textQuery,
            languageCode: 'tr',
            regionCode: 'TR',
            pageSize: 5,
          },
          {
            headers: {
              'Content-Type':
                'application/json',
              'X-Goog-Api-Key':
                apiKey,
              'X-Goog-FieldMask': [
                'places.id',
                'places.displayName',
                'places.formattedAddress',
                'places.googleMapsUri',
              ].join(','),
            },
            timeout: 30_000,
          },
        ),
      );

      return (response.data.places ?? [])
        .filter(
          (place) =>
            Boolean(
              place.id &&
              place.displayName?.text,
            ),
        )
        .slice(0, 5)
        .map((place) => ({
          placeId: place.id,
          name:
            place.displayName?.text ??
            cleanedTitle,
          address:
            place.formattedAddress,
          googleMapsUrl:
            place.googleMapsUri,
        }));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Google Places eşleştirme hatası: ${
            error.response?.status ??
            'bilinmiyor'
          } ${JSON.stringify(
            error.response?.data,
          )}`,
        );
      } else {
        this.logger.error(
          error instanceof Error
            ? error.message
            : String(error),
        );
      }

      throw new BadGatewayException(
        'Google Places üzerinden işletme bilgileri alınamadı.',
      );
    }
  }

  private extractInstagramUsername(
    instagramUrl: string,
    resultText: string,
  ): string | undefined {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(
        instagramUrl,
      );
    } catch {
      throw new BadRequestException(
        'Geçersiz Instagram adresi.',
      );
    }

    const hostname = parsedUrl.hostname
      .toLocaleLowerCase('en-US')
      .replace(/^www\./, '');

    if (hostname !== 'instagram.com') {
      throw new BadRequestException(
        'Yalnızca Instagram adresleri kabul edilir.',
      );
    }

    const pathParts =
      parsedUrl.pathname
        .split('/')
        .filter(Boolean);

    const blockedPaths = new Set([
      'p',
      'reel',
      'reels',
      'stories',
      'explore',
      'accounts',
    ]);

    const firstPath = pathParts[0];

    if (
      firstPath &&
      !blockedPaths.has(
        firstPath.toLocaleLowerCase(
          'en-US',
        ),
      )
    ) {
      return firstPath;
    }

    const mention =
      resultText.match(
        /@([a-zA-Z0-9._]+)/,
      );

    return mention?.[1];
  }

  private cleanTitle(
    title: string,
  ): string {
    return title
      .replace(
        /\s*[-|–]\s*Instagram.*$/i,
        '',
      )
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 150);
  }
}