import { Injectable ,NotFoundException} from '@nestjs/common';

import { BusinessService } from '../business/business.service';
import { SourceService } from '../source/source.service';
import { BusinessCrawler } from './business-crawler.interface';
import { BusinessType } from './crawler-business-type.enum';
import { CrawledBusiness } from './crawled-business.type';
import { CrawlerRegistry } from './crawler.registry';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly businessService: BusinessService,
    private readonly sourceService: SourceService,
    private readonly crawlerRegistry:CrawlerRegistry,
  ) {}

  async runByType(type: BusinessType): Promise<void> {
     const crawler = this.crawlerRegistry.get(type);

    if (!crawler) {
      throw new NotFoundException(
        `${type} için crawler bulunamadı.`,
      );
    }

    const businesses = await crawler.crawl();

    for (const business of businesses) {
      await this.processBusiness(crawler, business);
    }
  }


 private async processBusiness(
  crawler: BusinessCrawler,
  crawledBusiness: CrawledBusiness,
): Promise<void> {
   const business = await this.businessService.create({
    name: crawledBusiness.name,
    address: crawledBusiness.address,
    phone: crawledBusiness.phone,
    instagramUrl: crawledBusiness.instagramUrl,
    websiteUrl: crawledBusiness.websiteUrl,
    type: crawler.businessType,
  });

  await this.sourceService.create(
  business.id,
  crawledBusiness.sourceName,
  crawledBusiness.sourceUrl,
  crawledBusiness.externalId,
  );
 }
}