import { Injectable, Logger } from '@nestjs/common';
import { RetailTurkiyeAdapter } from './adapters/retail-türkiye.adapter';
import { HappyGroupAdapter } from './adapters/happy-group.adapter';
import { BusinessService } from '../business/business.service';
import { SourceService } from '../source/source.service';
import { Business } from '../business/business.entity';
import { CrawledBusiness } from './interfaces/crawled-business.interface';
@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly happyGroupAdapter: HappyGroupAdapter,
    private readonly businessService: BusinessService,
    private readonly sourceService: SourceService,
    private readonly retailTurkiyeAdapter:RetailTurkiyeAdapter,
  ) {}

async previewRetailTurkiye() {
  return this.retailTurkiyeAdapter.crawl();
}

async runRetailTurkiye() {
  const crawledBusinesses =
    await this.retailTurkiyeAdapter.crawl();

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
      'Retail Türkiye',
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

  async previewHappyGroup() {
    return this.happyGroupAdapter.crawl();
  }

  async runHappyGroup() {
  const crawledBusinesses =
    await this.happyGroupAdapter.crawl();

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

    const business = await this.businessService.create({
      name: crawled.name,
      phone: crawled.phone,
      address: crawled.address,
    });

    await this.sourceService.create(
      business.id,
      'Happy Group',
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