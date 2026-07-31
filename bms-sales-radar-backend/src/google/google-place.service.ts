import {
  BadGatewayException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { GooglePlaceEntity } from './entities/google-place.entity';
import { GooglePlace } from './interfaces/google-place.interface';
import {
  ISTANBUL_DISTRICTS,
  IstanbulDistrict,
} from './constants/istanbul-districts';

type BusinessType = 'cafe' | 'restaurant';

interface GoogleTextSearchResponse {
  places?: GooglePlace[];
  nextPageToken?: string;
}

export interface DistrictPlaceResult {
  district: IstanbulDistrict;
  success: boolean;
  places: GooglePlace[];
  error?: {
    status?: number;
    message: string;
    details?: unknown;
  };
}

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  private readonly apiUrl =
    'https://places.googleapis.com/v1/places:searchText';

  private readonly businessTypes: BusinessType[] = [
    'cafe',
    'restaurant',
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    @InjectRepository(GooglePlaceEntity)
    private readonly googlePlaceRepository:Repository<GooglePlaceEntity>,
  ) {}

  async searchBusinessesInIstanbul(): Promise<
    DistrictPlaceResult[]
  > {
    const apiKey =
      this.configService.getOrThrow<string>('GOOGLE_API_KEY');

    const results: DistrictPlaceResult[] = [];

    for (const district of ISTANBUL_DISTRICTS) {
      try {
        const districtPlaces: GooglePlace[] = [];

        for (const businessType of this.businessTypes) {
          const places = await this.searchDistrictByType(
            district,
            businessType,
            apiKey,
          );

          districtPlaces.push(...places);
        }

        const uniquePlaces =
          this.removeDuplicatePlaces(districtPlaces);

        results.push({
          district,
          success: true,
          places: uniquePlaces,
        });

        this.logger.log(
          `${district}: ${uniquePlaces.length} benzersiz işletme bulundu.`,
        );
      } catch (error: unknown) {
        const normalizedError = this.normalizeError(error);

        this.logger.error(
          `${district} taranamadı: ${normalizedError.message}`,
        );

        results.push({
          district,
          success: false,
          places: [],
          error: normalizedError,
        });
      }
    }

    const successfulDistrictCount = results.filter(
      (result) => result.success,
    ).length;

    if (successfulDistrictCount === 0) {
      throw new BadGatewayException({
        message: 'İstanbul ilçelerinin hiçbiri taranamadı.',
        districts: results,
      });
    }

    return results;
  }

  private async searchDistrictByType(
    district: IstanbulDistrict,
    businessType: BusinessType,
    apiKey: string,
  ): Promise<GooglePlace[]> {
    const results: GooglePlace[] = [];

    let pageToken: string | undefined;
    let pageNumber = 0;

    do {
      pageNumber++;

      const response = await firstValueFrom(
        this.httpService.post<GoogleTextSearchResponse>(
          this.apiUrl,
          {
            textQuery: `${district} İstanbul ${businessType}`,
            includedType: businessType,
            strictTypeFiltering: true,
            languageCode: 'tr',
            regionCode: 'TR',
            pageSize: 20,
            ...(pageToken
              ? {
                  pageToken,
                }
              : {}),
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': [
                'places.id',
                'places.displayName',
                'places.formattedAddress',
                'places.googleMapsUri',
                'nextPageToken',
              ].join(','),
            },
            timeout: 60_000,
          },
        ),
      );

      results.push(...(response.data.places ?? []));

      pageToken = response.data.nextPageToken;
    } while (pageToken && pageNumber < 3);

    this.logger.debug(
      `${district} / ${businessType}: ${results.length} sonuç`,
    );

    return this.removeDuplicatePlaces(results);
  }

  private removeDuplicatePlaces(
    places: GooglePlace[],
  ): GooglePlace[] {
    return Array.from(
      new Map(
        places.map((place) => [place.id, place]),
      ).values(),
    );
  }

  private normalizeError(error: unknown): {
    status?: number;
    message: string;
    details?: unknown;
  } {
    if (error instanceof AxiosError) {
      return {
        status: error.response?.status,
        message:
          error.message ||
          'Google Places API isteği başarısız oldu.',
        details: error.response?.data,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: 'Bilinmeyen bir hata oluştu.',
      details: error,
    };
  }
  async findNewBusinesses() {
  const districtResults =
    await this.searchBusinessesInIstanbul();

  const successfulResults = districtResults.filter(
    (result) => result.success,
  );

  const currentPlaces = successfulResults.flatMap((result) =>
    result.places.map((place) => ({
      district: result.district,
      place,
    })),
  );

  const uniqueCurrentPlaces = Array.from(
    new Map(
      currentPlaces.map((item) => [
        item.place.id,
        item,
      ]),
    ).values(),
  );

  if (uniqueCurrentPlaces.length === 0) {
    return {
      totalFound: 0,
      newPlaceCount: 0,
      newPlaces: [],
    };
  }

  const currentPlaceIds = uniqueCurrentPlaces.map(
    (item) => item.place.id,
  );

  const existingPlaces =
    await this.googlePlaceRepository.find({
      where: {
        placeId: In(currentPlaceIds),
      },
      select: {
        placeId: true,
      },
    });

  const existingPlaceIds = new Set(
    existingPlaces.map((place) => place.placeId),
  );

  const newPlaces = uniqueCurrentPlaces.filter(
    (item) => !existingPlaceIds.has(item.place.id),
  );

  await this.googlePlaceRepository.upsert(
    uniqueCurrentPlaces.map(({ district, place }) => ({
      placeId: place.id,
      district,
      displayName: place.displayName?.text,
      formattedAddress: place.formattedAddress,
      googleMapsUri: place.googleMapsUri,
      lastSeenAt: new Date(),
    })),
    {
      conflictPaths: ['placeId'],
      skipUpdateIfNoValuesChanged: true,
    },
  );

  return {
    totalFound: uniqueCurrentPlaces.length,
    newPlaceCount: newPlaces.length,
    newPlaces,
  };
}
}