import {
  Controller,
  Get,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { BusinessService } from '../business/business.service';
import { ExcelReportService } from '../report/excel-report.service';
import { BusinessType } from './crawler-business-type.enum';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly businessService: BusinessService,
    private readonly excelReportService: ExcelReportService,
  ) {}

  @Post('cafes/excel')
  async crawlCafesAndCreateReport(
    @Res() response: Response,
  ): Promise<void> {
    // 1. Fetch cafes from Google Maps and save them.
    await this.crawlerService.runByType(BusinessType.CAFE);

    // 2. Load saved businesses from the database.
    const businesses = await this.businessService.findAllSortedByScore();

    // 3. Convert them to Excel.
    const report = await this.excelReportService.createBusinessReport(
      businesses,
    );

    // 4. Return the Excel file.
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="google-maps-cafes.xlsx"',
    );

    response.send(report);
  }
}