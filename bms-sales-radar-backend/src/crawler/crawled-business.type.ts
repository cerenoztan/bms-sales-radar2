
export interface CrawledBusiness {
  externalId: string;

  name: string;

  address?: string;

  phone?: string;
  instagramUrl?: string;
  websiteUrl: string;

  sourceName: string;
  sourceUrl: string;

  openingDate?: Date;
  discoveredArea?: string;
}