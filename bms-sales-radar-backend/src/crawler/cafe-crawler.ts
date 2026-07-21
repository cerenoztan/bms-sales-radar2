import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BusinessCrawler } from './business-crawler.interface';
import { BusinessType } from './crawler-business-type.enum';
import { CrawledBusiness } from './crawled-business.type';

interface SearchArea {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

@Injectable()
export class CafeCrawler implements BusinessCrawler {
  readonly name = 'Google Places Cafe Crawler';
  readonly businessType = BusinessType.CAFE;

  private readonly searchAreas: SearchArea[] = [
    {
      name: 'Kadıköy',
      latitude: 40.991,
      longitude: 29.027,
      radius: 5000,
    },
    {
      name: 'Üsküdar',
      latitude: 41.0256,
      longitude: 29.0155,
      radius: 5000,
    },
  ];

  constructor(private readonly configService: ConfigService) {}

  async crawl(): Promise<CrawledBusiness[]> {
    const results: CrawledBusiness[] = [];

    for (const area of this.searchAreas) {
      const places = await this.searchFutureOpeningCafes(area);

      results.push(
        ...places
          .filter((place) => place.businessStatus === 'FUTURE_OPENING')
          .map(
  (place): CrawledBusiness => ({
    externalId: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    websiteUrl: place.websiteUri,

    sourceName: 'GOOGLE_PLACES',
    sourceUrl: place.googleMapsUri,

    openingDate: this.parseOpeningDate(place.openingDate),
    discoveredArea: area.name,
  }),
)
      );
    }

    return this.removeDuplicates(results);
  }

  private async searchFutureOpeningCafes(area: SearchArea): Promise<any[]> {
    const apiKey = this.configService.getOrThrow<string>(
      'GOOGLE_MAPS_API_KEY',
    );

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.businessStatus',
            'places.openingDate',
            'places.googleMapsUri',
            'places.websiteUri',
          ].join(','),
        },
        body: JSON.stringify({
          includedPrimaryTypes: ['cafe'],
          includeFutureOpeningBusinesses: true,
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: area.latitude,
                longitude: area.longitude,
              },
              radius: area.radius,
            },
          },
        }),
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
     throw new Error(
       `Google Places request failed: ${response.status} ${responseText}`,
      );
    }

    const data = JSON.parse(responseText);

    return data.places ?? [];
  }

  private parseOpeningDate(
    openingDate?: {
      year?: number;
      month?: number;
      day?: number;
    },
  ): Date | undefined {
    if (!openingDate?.year || !openingDate?.month) {
      return undefined;
    }

    return new Date(
      openingDate.year,
      openingDate.month - 1,
      openingDate.day ?? 1,
    );
  }

  private removeDuplicates(
    businesses: CrawledBusiness[],
  ): CrawledBusiness[] {
    return Array.from(
      new Map(
        businesses.map((business) => [
          business.externalId,
          business,
        ]),
      ).values(),
    );
  }
}