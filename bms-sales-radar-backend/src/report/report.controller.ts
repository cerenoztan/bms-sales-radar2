import {
  Controller,
  Get,
  StreamableFile,
} from '@nestjs/common';
import { BusinessStatus } from '../business/business-status.enum';
import { SalesPriority } from '../score/sales-priority.enum';
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
        id: '1',
        status: BusinessStatus.NEW,
        name: 'BMS Cafe',
        instagramUrl: 'https://instagram.com/bmscafe',
        address: 'Kadıköy / İstanbul',
        phone: '+905551112233',
        score: 92,
        salesPriority: SalesPriority.LOW,
        createdAt: new Date(),
      },
      {
        id: '2',
        status: BusinessStatus.VERIFIED,
        name: 'Coffee House',
        instagramUrl: 'https://instagram.com/coffeehouse',
        address: 'Beşiktaş / İstanbul',
        phone: '+905327654321',
        score: 76,
        salesPriority: SalesPriority.HIGH,
        createdAt: new Date(),
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