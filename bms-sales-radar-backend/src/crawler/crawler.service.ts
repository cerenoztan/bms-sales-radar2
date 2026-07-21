import { Injectable, Logger } from '@nestjs/common';

import { Business } from '../business/business.entity';
import { BusinessService } from '../business/business.service';
import { SourceService } from '../source/source.service';

import { FilgeziAdapter } from './adapters/filgezi.adapter';

export interface CrawlResult {
  discovered: number;
  processed: number;
  failed: number;
  businesses: Business[];
  errors: Array<{
    name: string;
    message: string;
  }>;
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly filgeziAdapter: FilgeziAdapter,
    private readonly businessService: BusinessService,
    private readonly sourceService: SourceService,
  ) {}

  async crawlFilgezi(): Promise<CrawlResult> {
    const crawledBusinesses =
      await this.filgeziAdapter.crawl();

    const savedBusinesses: Business[] = [];

    const errors: Array<{
      name: string;
      message: string;
    }> = [];

    for (const crawledBusiness of crawledBusinesses) {
      try {
        const business = await this.businessService.create({
          name: crawledBusiness.name,
          address: crawledBusiness.address,
          phone: crawledBusiness.phone,
          instagramUrl: crawledBusiness.instagramUrl,
        });

        await this.sourceService.create(
          business.id,
          crawledBusiness.sourceName,
          crawledBusiness.sourceUrl,
          crawledBusiness.externalId,
        );

        savedBusinesses.push(business);

        this.logger.log(
          `Business processed: ${business.name}`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        errors.push({
          name: crawledBusiness.name,
          message,
        });

        this.logger.error(
          `Business could not be processed: ${crawledBusiness.name}`,
          message,
        );
      }
    }

    return {
      discovered: crawledBusinesses.length,
      processed: savedBusinesses.length,
      failed: errors.length,
      businesses: savedBusinesses,
      errors,
    };
  }
}