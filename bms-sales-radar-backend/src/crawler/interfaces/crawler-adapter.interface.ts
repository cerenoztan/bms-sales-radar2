import { CrawledBusiness } from '../interfaces/crawled-business.interface';

export interface CrawlerAdapter {
  readonly sourceCode: string;

  crawl(): Promise<CrawledBusiness[]>;
}