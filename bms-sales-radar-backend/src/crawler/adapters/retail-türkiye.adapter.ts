import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

import { CrawledBusiness } from '../interfaces/crawled-business.interface';

@Injectable()
export class RetailTurkiyeAdapter {
  private readonly logger = new Logger(
    RetailTurkiyeAdapter.name,
  );

  private readonly categoryUrl =
    'https://retailturkiye.com/acilislar/';

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async crawl(): Promise<CrawledBusiness[]> {
    this.logger.log(
      'Retail Türkiye crawler başladı',
    );

    const html = await this.fetchHtml();

    const businesses = this.parseHtml(html);

    this.logger.log(
      `${businesses.length} işletme bulundu`,
    );

    return businesses;
  }

  private async fetchHtml(): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get<string>(
        this.categoryUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
              'AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,' +
              'application/xml;q=0.9,*/*;q=0.8',
          },
          timeout: 15000,
        },
      ),
    );

    return response.data;
  }

  private parseHtml(
    html: string,
  ): CrawledBusiness[] {
    const $ = cheerio.load(html);

    const businesses: CrawledBusiness[] = [];

    $('.mvp-blog-story-wrap').each(
      (_, element) => {
        const card = $(element);

        const linkElement = card
          .find('a')
          .first();

        const title = card
          .find('.mvp-blog-story-text h2')
          .first()
          .text()
          .trim();

        const sourceUrl =
          linkElement.attr('href');

        const relativeDate = card
          .find('.mvp-cd-date')
          .first()
          .text()
          .trim();

        const excerpt = card
          .find('.mvp-blog-story-text p')
          .first()
          .text()
          .trim();

        if (!title || !sourceUrl) {
          return;
        }

        if (!this.isIstanbul(title)) {
          return;
        }

        if (
          !this.isWithinLastSixMonths(
            relativeDate,
          )
        ) {
          return;
        }

        const businessName =
          this.extractBusinessName(title);

        const address =
          this.extractAddress(excerpt);

        const duplicateKey =
          this.createDuplicateKey(
            businessName,
            address,
          );

        businesses.push({
          name: businessName,
          address,
          sourceUrl,
          externalId:
            this.createExternalId(sourceUrl),
          openingStatus: 'OPENED',

          rawData: {
            city: 'İstanbul',
            articleTitle: title,
            relativeDate,
            excerpt,
            sourceCode:
              'RETAIL_TURKIYE',
            duplicateKey,
          },
        });
      },
    );

    return this.removeDuplicates(
      businesses,
    );
  }

  private extractBusinessName(
    title: string,
  ): string {
    const normalizedTitle =
      title.trim();

    const separators = [
      ',',
      '’tan',
      "'tan",
      '’ten',
      "'ten",
      '’dan',
      "'dan",
      '’den',
      "'den",
      '’ta',
      "'ta",
      '’te',
      "'te",
      '’da',
      "'da",
      '’de',
      "'de",
    ];

    for (const separator of separators) {
      const index =
        normalizedTitle
          .toLocaleLowerCase('tr-TR')
          .indexOf(
            separator.toLocaleLowerCase(
              'tr-TR',
            ),
          );

      if (index > 0) {
        return normalizedTitle
          .slice(0, index)
          .trim();
      }
    }

    return normalizedTitle;
  }

  private extractAddress(
  excerpt: string,
 ): string | undefined {
  const normalizedExcerpt = excerpt
    .replace(/\s+/g, ' ')
    .trim();

  const match = normalizedExcerpt.match(
    /([A-ZÇĞİÖŞÜa-zçğıöşü\s]+Mahallesi,\s*[A-ZÇĞİÖŞÜa-zçğıöşü\s]+Caddesi\s+No:\s*\d+)/,
  );

  if (!match?.[1]) {
    return undefined;
  }

  return match[1]
    .replace(/^\s*(?:de|da|te|ta)\s+/i, '')
    .trim();
 }

  private createDuplicateKey(
  name: string,
  address?: string,
 ): string {
  const normalizedName =
    this.normalizeText(name);

  const normalizedAddress =
    address
      ? this.normalizeText(address)
      : '';

  return `${normalizedName}-${normalizedAddress}`
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  }

  private removeDuplicates(
    businesses: CrawledBusiness[],
  ): CrawledBusiness[] {
    const uniqueBusinesses =
      new Map<string, CrawledBusiness>();

    for (const business of businesses) {
      const rawDuplicateKey =
        business.rawData?.duplicateKey;

      const key =
        typeof rawDuplicateKey === 'string'
          ? rawDuplicateKey
          : business.externalId ??
            business.sourceUrl;

      const existing =
        uniqueBusinesses.get(key);

      if (!existing) {
        uniqueBusinesses.set(
          key,
          business,
        );
        continue;
      }

      if (
        !existing.address &&
        business.address
      ) {
        uniqueBusinesses.set(
          key,
          business,
        );
      }
    }

    return Array.from(
      uniqueBusinesses.values(),
    );
  }

  private isWithinLastSixMonths(
    relativeDate: string,
  ): boolean {
    const normalizedDate =
      this.normalizeText(relativeDate);

    if (
      normalizedDate.includes(
        'gun once',
      ) ||
      normalizedDate.includes(
        'hafta once',
      )
    ) {
      return true;
    }

    const monthMatch =
      normalizedDate.match(
        /(\d+)\s*ay once/,
      );

    if (!monthMatch) {
      return false;
    }

    const monthCount =
      Number(monthMatch[1]);

    return monthCount <= 6;
  }

  private isIstanbul(
    text: string,
  ): boolean {
    const normalizedText =
      this.normalizeText(text);

    const istanbulKeywords = [
      'istanbul',
      'tuzla',
      'kartal',
      'yakacik',
      'kozyatagi',
      'kadikoy',
      'uskudar',
      'besiktas',
      'sisli',
      'bakirkoy',
      'maltepe',
      'pendik',
      'atasehir',
      'umraniye',
      'sariyer',
      'beyoglu',
      'fatih',
      'bagcilar',
      'bahcelievler',
      'kucukcekmece',
      'buyukcekmece',
      'beylikduzu',
      'avcilar',
      'esenler',
      'sancaktepe',
      'cekmekoy',
      'eyupsultan',
      'gaziosmanpasa',
      'basaksehir',
    ];

    return istanbulKeywords.some(
      keyword =>
        normalizedText.includes(
          keyword,
        ),
    );
  }

  private normalizeText(
    value: string,
  ): string {
    return value
      .toLocaleLowerCase('tr-TR')
      .replaceAll('ı', 'i')
      .replaceAll('ğ', 'g')
      .replaceAll('ü', 'u')
      .replaceAll('ş', 's')
      .replaceAll('ö', 'o')
      .replaceAll('ç', 'c');
  }

  private createExternalId(
    sourceUrl: string,
  ): string {
    return sourceUrl
      .replace(
        'https://retailturkiye.com/acilislar/',
        '',
      )
      .replaceAll('/', '');
  }
}