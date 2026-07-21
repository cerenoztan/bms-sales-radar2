import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Business } from '../business/business.entity';
import { ScoreService } from '../score/score.calculator';


@Injectable()
export class ExcelReportService {
  constructor(private readonly scoreService: ScoreService) {}

  async createBusinessReport(
    businesses: Business[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Businesses');

    worksheet.columns = [
      {
        header: 'Name',
        key: 'name',
        width: 30,
      },
      {
        header: 'Address',
        key: 'address',
        width: 40,
      },
      {
        header: 'Phone',
        key: 'phone',
        width: 20,
      },
      {
        header: 'Instagram',
        key: 'instagramUrl',
        width: 30,
      },
      {
        header:'Google Maps',
        key:'googleMapsUrl',
        width:25,
      },
      {
        header: 'Sales Priority',
        key: 'salesPriority',
        width: 20,
      },
    ];
    businesses.forEach((business)=>{
      const scoredBusiness=this.scoreService.createScoredBusiness(business);
      const googleMapsSource=business.sources?.find((source)=> source.name=='GOOGLE_PLACES',);

      const row = worksheet.addRow({
        name: business.name,
        address: business.address,
        phone: business.phone ?? '',
        instagramUrl: business.instagramUrl ?? '',
        googleMapsUrl: '',
        salesPriority: scoredBusiness.salesPriority,
      });
      if (googleMapsSource?.url) {
        const googleMapsCell = row.getCell('googleMapsUrl');

        googleMapsCell.value = {
          text: 'Open in Google Maps',
          hyperlink: googleMapsSource.url,
        };
        googleMapsCell.font = {
          color: {
            argb: 'FF0000FF',
          },
          underline: true,
        };
      }

    });


    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}

// NestJS automatically creates ScoreService object 
//dependency injection

//waiting (await) for excel file to be produced,takes time