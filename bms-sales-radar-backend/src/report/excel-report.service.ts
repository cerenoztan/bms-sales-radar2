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
        header: 'Sales Priority',
        key: 'salesPriority',
        width: 20,
      },
    ];

    const scoredBusinesses = businesses.map((business) =>
      this.scoreService.createScoredBusiness(business),
    );

    scoredBusinesses.forEach((business) => {
      worksheet.addRow({
        name: business.name,
        address: business.address,
        phone: business.phone ?? '',
        instagramUrl: business.instagramUrl ?? '',
        salesPriority: business.salesPriority,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}

// NestJS automatically creates ScoreService object 
//dependency injection

//waiting (await) for excel file to be produced,takes time