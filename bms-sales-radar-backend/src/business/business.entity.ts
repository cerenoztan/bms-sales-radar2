import { SalesPriority } from "../score/sales-priority.enum";
export class Business {

  name!: string;

  instagramUrl?: string;

  address!: string;

  phone?: string;

  score?: number;

  salesPriority?: SalesPriority;

}

//salesPriority değerini hesapla 
//actual Object