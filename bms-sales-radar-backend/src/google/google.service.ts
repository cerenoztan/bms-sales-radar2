import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { GooglePlace } from './interfaces/google-place.interface';
import { ISTANBUL_DISTRICTS } from './constants/istanbul-districts';

interface GoogleTextSearchResponse {
  places?: GooglePlace[];
  nextPageToken?: string;
}

@Injectable()
export class GoogleService {
  private readonly apiUrl =
    'https://places.googleapis.com/v1/places:searchText';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async searchFutureBusinesses(
    query: string,
    type: 'cafe' | 'restaurant',
  ): Promise<GooglePlace[]> {
    const apiKey =
      this.configService.getOrThrow<string>('GOOGLE_API_KEY');

    try {
      const response = await firstValueFrom(
        this.httpService.post<GoogleTextSearchResponse>(
          this.apiUrl,
          {
            textQuery: query,

            includedType: type,
            strictTypeFiltering: true,

            includeFutureOpeningBusinesses: true,

            languageCode: 'tr',
            regionCode: 'TR',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': [
                'places.id',
                'places.displayName',
                'places.formattedAddress',
                'places.primaryType',
                'places.businessStatus',
                'places.openingDate',
                'places.googleMapsUri',
              ].join(','),
            },
          },
        ),
      );

      const places= response.data.places ?? [];

      return places.filter(
        (place) => place.businessStatus === 'FUTURE_OPENING',
        );

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new BadGatewayException({
          message: 'Google Places API isteği başarısız oldu.',
          googleError: error.response?.data,
        });
      }

      throw error;
    }
  }
  async searchFutureBusinessesInIstanbul(
  type: 'cafe' | 'restaurant',
    ) : Promise<GooglePlace[]> {
    const results: GooglePlace[] = [];

     for (const district of ISTANBUL_DISTRICTS) {
      const places = await this.searchFutureBusinesses(
      `${district} İstanbul`,
      type,
    );

      results.push(...places);
     }

     return Array.from(
     new Map(results.map(place => [place.id, place])).values(),
         );
    }
}