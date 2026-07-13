import {
  Controller,
  Get,
  StreamableFile,
} from '@nestjs/common';
import { Business } from '../business/business.entity';
import { ExcelReportService } from './excel-report.service';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly excelReportService: ExcelReportService,
  ) {}

  @Get('businesses/excel')
  async downloadBusinessReport(): Promise<StreamableFile> {
    const businesses: Business[] = [
      {
        name: 'Coffee House',
        address: 'Kadıköy, İstanbul',
        phone: '0555 111 22 33',
        instagramUrl: 'https://instagram.com/coffeehouse',
      },
      {
        name: 'Green Market',
        address: 'Beşiktaş, İstanbul',
      },
      {
        name: 'New Restaurant',
        address: 'Şişli, İstanbul',
        phone: '0555 444 55 66',
      },
    ];

    const buffer =
      await this.excelReportService.createBusinessReport(
        businesses,
      );

    return new StreamableFile(buffer, {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition:
        'attachment; filename="business-report.xlsx"',
    });
  }
}