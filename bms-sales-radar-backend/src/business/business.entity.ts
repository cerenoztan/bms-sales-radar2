import { SalesPriority } from "../score/sales-priority.enum";
import { BusinessStatus } from "./business-status.enum";

export class Business {
  id!:string;

  status!:BusinessStatus;
   
  name!: string;

  instagramUrl?: string;

  address!: string;

  phone?: string;

  score?: number;

  salesPriority?: SalesPriority;

  createdAt!:Date;

}