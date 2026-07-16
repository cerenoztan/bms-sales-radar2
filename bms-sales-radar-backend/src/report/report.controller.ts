import {
  Controller,
  Get,
  StreamableFile,
} from '@nestjs/common';
import { BusinessStatus } from '../business/business-status.enum';
import { SalesPriority } from '../score/sales-priority.enum';
import { Business } from '../business/business.entity';
import { ExcelReportService } from './excel-report.service';
import { BusinessService } from '../business/business.service';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly excelReportService: ExcelReportService,
    private readonly businessService:BusinessService,
  ) {}

  @Get('businesses/excel')
  async downloadBusinessReport(): Promise<StreamableFile> {
    const businesses= await this.businessService.findAllSortedByScore();
    
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