import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

import { CrawledBusiness } from '../crawler.types';

@Injectable()
export class FilgeziAdapter {
  private readonly pageUrl =
    'https://www.filgezi.com/istanbulun-yeni-mekanlari-2026/';

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async crawl(): Promise<CrawledBusiness[]> {
    const response = await firstValueFrom(
      this.httpService.get<string>(this.pageUrl, {
        timeout: 15_000,
        headers: {
          'User-Agent':
            'BMS-Sales-Radar/1.0 crawler',
        },
      }),
    );

    const $ = cheerio.load(response.data);
    const businesses: CrawledBusiness[] = [];

    $('h2').each((_index, headingElement) => {
      const name = $(headingElement).text().trim();

      if (!name) {
        return;
      }

      const address = this.findAddressAfterHeading(
        $,
        headingElement,
      );

      if (!address) {
        return;
      }

      businesses.push({
        name,
        address,
        sourceName: 'FilGezi',
        sourceUrl: this.pageUrl,
        externalId: this.createExternalId(name, address),
      });
    });

    return businesses;
  }

  private findAddressAfterHeading(
    $: cheerio.CheerioAPI,
    headingElement: any,
  ): string | undefined {
    let currentElement = $(headingElement).next();

    while (currentElement.length > 0) {
      if (currentElement.is('h2')) {
        break;
      }

      const text = currentElement.text().trim();

      if (text.toLocaleLowerCase('tr-TR').startsWith('adres:')) {
        return text.replace(/^adres:\s*/i, '').trim();
      }

      currentElement = currentElement.next();
    }

    return undefined;
  }

  private createExternalId(
    name: string,
    address: string,
  ): string {
    return `${name}-${address}`
      .toLocaleLowerCase('tr-TR')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '');
  }
}