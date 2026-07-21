import { CrawledBusiness } from "./crawled-business.type";
import { BusinessType } from "./crawler-business-type.enum";
//common interface for each crawler 
export interface BusinessCrawler{
    readonly name:string;

    readonly businessType:BusinessType;

    crawl():Promise<CrawledBusiness[]>;
}

