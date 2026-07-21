export interface CrawledBusiness {
  name: string;
  address: string;
  phone?: string;
  instagramUrl?: string;

  sourceName: string;
  sourceUrl: string;
  externalId?: string;
}