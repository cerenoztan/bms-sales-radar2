import { Injectable } from '@nestjs/common';

import { BusinessCrawler } from './business-crawler.interface';
import { BusinessType } from './crawler-business-type.enum';
import { CafeCrawler } from './cafe-crawler';

@Injectable()
export class CrawlerRegistry {
  private readonly crawlers = new Map<BusinessType, BusinessCrawler>();

  constructor(private readonly cafeCrawler: CafeCrawler) {
    this.crawlers.set(
      this.cafeCrawler.businessType,
      this.cafeCrawler,
    );
  }

  get(type: BusinessType): BusinessCrawler | undefined {
    return this.crawlers.get(type);
  }

  getAll(): BusinessCrawler[] {
    return Array.from(this.crawlers.values());
  }
}