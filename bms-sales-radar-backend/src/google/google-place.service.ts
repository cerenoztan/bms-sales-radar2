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

import {
  GooglePlaceComparisonStatus,
  GooglePlaceEntity,
} from './entities/google-place.entity';
import {
  GoogleScanRunEntity,
  GoogleScanStatus,
} from './entities/google-scan-run.entity';
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

    @InjectRepository(GoogleScanRunEntity)
    private readonly googleScanRunRepository: Repository<GoogleScanRunEntity>,
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
                'places.nationalPhoneNumber',
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
    const scanRun = await this.googleScanRunRepository.save(
      this.googleScanRunRepository.create({
        status: GoogleScanStatus.RUNNING,
      }),
    );

    try {
      const previousRun = await this.googleScanRunRepository.findOne({
        where: { status: GoogleScanStatus.COMPLETED },
        order: { id: 'DESC' },
      });

      const districtResults = await this.searchBusinessesInIstanbul();
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
          currentPlaces.map((item) => [item.place.id, item]),
        ).values(),
      );

      const currentPlaceIds = uniqueCurrentPlaces.map(
        (item) => item.place.id,
      );

      const existingPlaces = currentPlaceIds.length
        ? await this.googlePlaceRepository.find({
            where: { placeId: In(currentPlaceIds) },
          })
        : [];

      const existingById = new Map(
        existingPlaces.map((place) => [place.placeId, place]),
      );

      const now = new Date();
      const placesToSave: GooglePlaceEntity[] = [];
      const firstObservedPlaces: typeof uniqueCurrentPlaces = [];
      const confirmedPlaces: GooglePlaceEntity[] = [];

      for (const { district, place } of uniqueCurrentPlaces) {
        const existing = existingById.get(place.id);

        if (!existing) {
          firstObservedPlaces.push({ district, place });
          placesToSave.push(
            this.googlePlaceRepository.create({
              placeId: place.id,
              district,
              displayName: place.displayName?.text,
              formattedAddress: place.formattedAddress,
              nationalPhoneNumber: place.nationalPhoneNumber,
              googleMapsUri: place.googleMapsUri,
              firstSeenAt: now,
              lastSeenAt: now,
              firstSeenRunId: scanRun.id,
              lastSeenRunId: scanRun.id,
              seenCount: 1,
              comparisonStatus: previousRun
                ? GooglePlaceComparisonStatus.CANDIDATE
                : GooglePlaceComparisonStatus.BASELINE,
            }),
          );
          continue;
        }

        const appearedInPreviousRun =
          previousRun && existing.lastSeenRunId === previousRun.id;

        existing.district = district;
        existing.displayName = place.displayName?.text;
        existing.formattedAddress = place.formattedAddress;
        existing.nationalPhoneNumber = place.nationalPhoneNumber;
        existing.googleMapsUri = place.googleMapsUri;
        existing.lastSeenAt = now;
        existing.lastSeenRunId = scanRun.id;
        existing.seenCount += 1;

        if (
          existing.comparisonStatus ===
            GooglePlaceComparisonStatus.CANDIDATE &&
          appearedInPreviousRun
        ) {
          existing.comparisonStatus =
            GooglePlaceComparisonStatus.CONFIRMED;
          existing.confirmedAt = now;
          existing.confirmedRunId = scanRun.id;
          confirmedPlaces.push(existing);
        }

        placesToSave.push(existing);
      }

      if (placesToSave.length) {
        await this.googlePlaceRepository.save(placesToSave);
      }

      scanRun.status = GoogleScanStatus.COMPLETED;
      scanRun.totalFound = uniqueCurrentPlaces.length;
      scanRun.firstObservedCount = firstObservedPlaces.length;
      scanRun.confirmedCount = confirmedPlaces.length;
      scanRun.successfulDistrictCount = successfulResults.length;
      scanRun.failedDistrictCount =
        districtResults.length - successfulResults.length;
      scanRun.completedAt = now;
      await this.googleScanRunRepository.save(scanRun);

      return {
        scanRunId: scanRun.id,
        baselineCreated: !previousRun,
        totalFound: uniqueCurrentPlaces.length,
        firstObservedCount: firstObservedPlaces.length,
        confirmedCount: confirmedPlaces.length,
        newPlaceCount: previousRun ? firstObservedPlaces.length : 0,
        newPlaces: previousRun ? firstObservedPlaces : [],
      };
    } catch (error) {
      scanRun.status = GoogleScanStatus.FAILED;
      scanRun.completedAt = new Date();
      scanRun.errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.googleScanRunRepository.save(scanRun);
      throw error;
    }
  }

  async findLatestNewCandidates(): Promise<GooglePlaceEntity[]> {
    const latestRun = await this.googleScanRunRepository.findOne({
      where: { status: GoogleScanStatus.COMPLETED },
      order: { id: 'DESC' },
    });

    if (!latestRun) {
      return [];
    }

    return this.googlePlaceRepository.find({
      where: {
        comparisonStatus: GooglePlaceComparisonStatus.CANDIDATE,
        firstSeenRunId: latestRun.id,
      },
      order: {
        district: 'ASC',
        displayName: 'ASC',
      },
    });
  }
}
