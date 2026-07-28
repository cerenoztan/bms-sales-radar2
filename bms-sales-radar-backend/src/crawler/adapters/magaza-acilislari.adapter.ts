import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

import { CrawledBusiness } from '../interfaces/crawled-business.interface';

@Injectable()
export class MagazaAcilislariAdapter {
  private readonly baseUrl =
    'https://magazaacilislari.com';

  private readonly istanbulKeywords = [
    'istanbul',
    'adalar',
    'arnavutköy',
    'ataşehir',
    'avcılar',
    'bağcılar',
    'bahçelievler',
    'bakırköy',
    'başakşehir',
    'bayrampaşa',
    'beşiktaş',
    'beykoz',
    'beylikdüzü',
    'beyoğlu',
    'büyükçekmece',
    'çatalca',
    'çekmeköy',
    'esenler',
    'esenyurt',
    'eyüpsultan',
    'fatih',
    'gaziosmanpaşa',
    'güngören',
    'kadıköy',
    'kağıthane',
    'kartal',
    'küçükçekmece',
    'maltepe',
    'pendik',
    'sancaktepe',
    'sarıyer',
    'silivri',
    'sultanbeyli',
    'sultangazi',
    'şile',
    'şişli',
    'tuzla',
    'üsküdar',
    'ümraniye',
    'zeytinburnu',
  ];

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async crawl(): Promise<CrawledBusiness[]> {
    const latestArchiveUrl =
      await this.getLatestArchiveUrl();

    const businesses =
      await this.getAllBusinesses(
        latestArchiveUrl,
      );

    return this.removeDuplicates(
      businesses,
    );
  }

  private async getLatestArchiveUrl(): Promise<string> {
    const html = await this.fetchHtml(
      this.baseUrl,
    );

    const $ = cheerio.load(html);

    const href = $(
      '.wp-block-archives li:first-child a',
    ).attr('href');

    if (!href) {
      throw new Error(
        'Latest archive not found',
      );
    }

    return this.toAbsoluteUrl(href);
  }

  private async getAllBusinesses(
    firstPageUrl: string,
  ): Promise<CrawledBusiness[]> {
    const allBusinesses: CrawledBusiness[] = [];
    const visitedPages = new Set<string>();

    let currentPageUrl: string | undefined =
      firstPageUrl;

    while (
      currentPageUrl &&
      !visitedPages.has(currentPageUrl)
    ) {
      visitedPages.add(currentPageUrl);

      const html = await this.fetchHtml(
        currentPageUrl,
      );

      const pageBusinesses =
        this.parseBusinessesFromHtml(
          html,
        );

      allBusinesses.push(
        ...pageBusinesses,
      );

      currentPageUrl =
        this.getNextPageUrl(html);
    }

    return allBusinesses;
  }

  private parseBusinessesFromHtml(
    html: string,
  ): CrawledBusiness[] {
    const $ = cheerio.load(html);

    const businesses: CrawledBusiness[] = [];

    $('#post-wrapper article').each(
      (_, element) => {
        const article = $(element);

        const titleElement = article
          .find('.entry-title a')
          .first();

        const title = this.cleanText(
          titleElement.text(),
        );

        const href =
          titleElement.attr('href');

        if (!title || !href) {
          return;
        }

        const {
          name,
          address,
        } = this.splitBusinessTitle(
          title,
        );

        const formattedName =
          this.formatWords(name);

        const formattedAddress = address
          ? this.formatWords(address)
          : undefined;

        const dateElement = article
          .find(
            'time.entry-date.published',
          )
          .first();

        const date =
          dateElement.attr('datetime') ??
          this.cleanText(
            dateElement.text(),
          );

        const excerpt = this.cleanText(
          article
            .find(
              '.entry-content, .entry-excerpt',
            )
            .first()
            .text(),
        );

        const searchableText =
          this.normalizeText(
            `${title} ${excerpt}`,
          );

        const isIstanbul =
          this.istanbulKeywords.some(
            (keyword) =>
              searchableText.includes(
                this.normalizeText(
                  keyword,
                ),
              ),
          );

        if (!isIstanbul) {
          return;
        }

        const sourceUrl =
          this.toAbsoluteUrl(href);

        businesses.push({
          name: formattedName,
          address: formattedAddress,
          sourceUrl,
          externalId: sourceUrl,
          openingStatus: 'OPENING',
          rawData: {
            originalTitle: title,
            date: date || undefined,
            excerpt:
              excerpt || undefined,
            source:
              'magazaacilislari.com',
          },
        });
      },
    );

    return businesses;
  }

  private splitBusinessTitle(
    title: string,
  ): {
    name: string;
    address?: string;
  } {
    const separators = [
      ' - ',
      ', ',
    ];

    for (const separator of separators) {
      const separatorIndex =
        title.indexOf(separator);

      if (separatorIndex === -1) {
        continue;
      }

      const name = title
        .slice(0, separatorIndex)
        .trim();

      const address = title
        .slice(
          separatorIndex +
            separator.length,
        )
        .trim();

      if (name && address) {
        return {
          name,
          address,
        };
      }
    }

    return {
      name: title.trim(),
    };
  }

  private formatWords(
    value: string,
  ): string {
    return this.cleanText(value)
      .toLocaleLowerCase('tr-TR')
      .split(' ')
      .map((word) =>
        this.capitalizeWord(word),
      )
      .join(' ');
  }

  private capitalizeWord(
    word: string,
  ): string {
    if (!word) {
      return word;
    }

    const firstLetter =
      word.charAt(0)
        .toLocaleUpperCase('tr-TR');

    const remainingLetters =
      word.slice(1)
        .toLocaleLowerCase('tr-TR');

    return `${firstLetter}${remainingLetters}`;
  }

  private getNextPageUrl(
    html: string,
  ): string | undefined {
    const $ = cheerio.load(html);

    const href = $(
      '.nav-links a.next',
    ).attr('href');

    if (!href) {
      return undefined;
    }

    return this.toAbsoluteUrl(href);
  }

  private removeDuplicates(
    businesses: CrawledBusiness[],
  ): CrawledBusiness[] {
    const uniqueBusinesses = new Map<
      string,
      CrawledBusiness
    >();

    for (const business of businesses) {
      if (
        !uniqueBusinesses.has(
          business.sourceUrl,
        )
      ) {
        uniqueBusinesses.set(
          business.sourceUrl,
          business,
        );
      }
    }

    return [
      ...uniqueBusinesses.values(),
    ];
  }

  private async fetchHtml(
    url: string,
  ): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get<string>(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/126.0.0.0 Safari/537.36',

          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',

          'Accept-Language':
            'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 15000,
      }),
    );

    return response.data;
  }

  private toAbsoluteUrl(
    href: string,
  ): string {
    return new URL(
      href,
      this.baseUrl,
    ).toString();
  }

  private cleanText(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeText(
    value: string,
  ): string {
    return this.cleanText(value)
      .toLocaleLowerCase('tr-TR')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u');
  }
}