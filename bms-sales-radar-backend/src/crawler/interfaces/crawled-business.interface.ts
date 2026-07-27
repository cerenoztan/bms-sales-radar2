export interface CrawledBusiness {
  name: string;

  phone?: string;
  address?: string;

  externalId?: string;
  sourceUrl: string;

  openingStatus?: string;

  rawData?: Record<string, unknown>;
}