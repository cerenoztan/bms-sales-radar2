import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

import { CrawlerAdapter } from '../interfaces/crawler-adapter.interface';
import { CrawledBusiness } from '../interfaces/crawled-business.interface';

@Injectable()
export class HappyGroupAdapter implements CrawlerAdapter {
  readonly sourceCode = 'HAPPY_GROUP';

  private readonly logger = new Logger(HappyGroupAdapter.name);
  private readonly sourceUrl = 'https://www.happygroup.com.tr/';

  constructor(private readonly httpService: HttpService) {}

  async crawl(): Promise<CrawledBusiness[]> {
    this.logger.log(`Happy Group taraması başladı: ${this.sourceUrl}`);

    const html = await this.fetchHtml();
    const businesses = this.parseHtml(html);

    this.logger.log(
      `Happy Group taraması tamamlandı. ${businesses.length} kayıt bulundu.`,
    );

    return businesses;
  }

  private async fetchHtml(): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get<string>(this.sourceUrl, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; BMSSalesRadar/1.0)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        },
        responseType: 'text',
      }),
    );

    return response.data;
  }

  private parseHtml(html: string): CrawledBusiness[] {
    const $ = cheerio.load(html);
    const businesses: CrawledBusiness[] = [];

    $('.testimonial-section .swiper-slide').each((_, element) => {
      const location = $(element).find('h6').first().text().trim();

      if (!location) {
        return;
      }

      const normalizedLocation = this.normalizeText(location);

      businesses.push({
        name: `Happy Moon's - ${location}`,
        externalId: `happy-group-${this.slugify(normalizedLocation)}`,
        sourceUrl: this.sourceUrl,
        rawData: {
          brand: "Happy Moon's",
          location,
          openingStatus: 'Çok Yakında',
          sourceCode: this.sourceCode,
        },
      });
    });

    return this.removeDuplicates(businesses);
  }

  private removeDuplicates(
    businesses: CrawledBusiness[],
  ): CrawledBusiness[] {
    const uniqueBusinesses = new Map<string, CrawledBusiness>();

    for (const business of businesses) {
      const key = business.externalId ?? business.name;

      if (!uniqueBusinesses.has(key)) {
        uniqueBusinesses.set(key, business);
      }
    }

    return [...uniqueBusinesses.values()];
  }

  private normalizeText(value: string): string {
    return value
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private slugify(value: string): string {
    return value
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}