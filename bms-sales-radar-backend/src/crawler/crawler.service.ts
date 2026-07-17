import { Injectable } from '@nestjs/common';

import { BusinessService } from '../business/business.service';
import { SourceService } from '../source/source.service';
import { Business } from '../business/business.entity';
import { Source } from '../source/source.entity';

@Injectable()
export class CrawlerService{
      constructor(
    private readonly businessService: BusinessService,
    private readonly sourceService: SourceService,) {}

    async runTestCrawler() {
    const businesses = [
      {
        name: 'Crawler Test Cafe',
        address: 'Kadıköy, İstanbul',
        phone: '+905551234567',
        instagramUrl:
          'https://instagram.com/crawler_test_cafe',
        sourceName: 'Test Crawler',
        sourceUrl:
          'https://example.com/crawler-test-cafe',
      },
      {
        name: 'Crawler Test Market',
        address: 'Üsküdar, İstanbul',
        phone: '+905559876543',
        instagramUrl:
          'https://instagram.com/crawler_test_market',
        sourceName: 'Test Crawler',
        sourceUrl:
          'https://example.com/crawler-test-market',
      },
    ];
    //
    const results: Array<{
        business:Business;
        source:Source;}>=[];

    for (const item of businesses) {
      const business = await this.businessService.create({
        name: item.name,
        address: item.address,
        phone: item.phone,
        instagramUrl: item.instagramUrl,
    });
      const source=await this.sourceService.create(
        business.id,
        item.sourceName,
        item.sourceUrl,);
      results.push({business,source,});
    }

    return results;
  }
   

}