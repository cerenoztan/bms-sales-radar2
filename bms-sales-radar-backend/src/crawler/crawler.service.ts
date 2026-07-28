import { Injectable, Logger } from '@nestjs/common';

import { RetailTurkiyeAdapter } from './adapters/retail-türkiye.adapter';
import { HappyGroupAdapter } from './adapters/happy-group.adapter';
import { MagazaAcilislariAdapter } from './adapters/magaza-acilislari.adapter';

import { BusinessService } from '../business/business.service';
import { SourceService } from '../source/source.service';

import { Business } from '../business/business.entity';
import { CrawledBusiness } from './interfaces/crawled-business.interface';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly happyGroupAdapter: HappyGroupAdapter,
    private readonly retailTurkiyeAdapter: RetailTurkiyeAdapter,
    private readonly magazaAcilislariAdapter: MagazaAcilislariAdapter,
    private readonly businessService: BusinessService,
    private readonly sourceService: SourceService,
  ) {}

  async previewRetailTurkiye() {
    return this.retailTurkiyeAdapter.crawl();
  }

  async runRetailTurkiye() {
    return this.runCrawler(
      this.retailTurkiyeAdapter,
      'Retail Türkiye',
    );
  }

  async previewHappyGroup() {
    return this.happyGroupAdapter.crawl();
  }

  async runHappyGroup() {
    return this.runCrawler(
      this.happyGroupAdapter,
      'Happy Group',
    );
  }

  async previewMagazaAcilislari() {
    return this.magazaAcilislariAdapter.crawl();
  }

  async runMagazaAcilislari() {
    return this.runCrawler(
      this.magazaAcilislariAdapter,
      'Mağaza Açılışları',
    );
  }

  private async runCrawler(
    adapter: {
      crawl(): Promise<CrawledBusiness[]>;
    },
    sourceName: string,
  ) {
    const crawledBusinesses =
      await adapter.crawl();

    const createdBusinesses: Business[] = [];
    const skippedBusinesses: CrawledBusiness[] = [];

    for (const crawled of crawledBusinesses) {
      if (crawled.externalId) {
        const existingSource =
          await this.sourceService.findByExternalId(
            crawled.externalId,
          );

        if (existingSource) {
          this.logger.log(
            `Kayıt zaten mevcut, atlandı: ${crawled.name}`,
          );

          skippedBusinesses.push(crawled);
          continue;
        }
      }

      const business =
        await this.businessService.create({
          name: crawled.name,
          phone: crawled.phone,
          address: crawled.address,
        });

      await this.sourceService.create(
        business.id,
        sourceName,
        crawled.sourceUrl,
        crawled.externalId,
      );

      createdBusinesses.push(business);

      this.logger.log(
        `Business oluşturuldu: ${business.name}`,
      );
    }

    return {
      found: crawledBusinesses.length,
      created: createdBusinesses.length,
      skipped: skippedBusinesses.length,
      businesses: createdBusinesses,
    };
  }
}