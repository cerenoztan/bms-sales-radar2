import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
//Cron comes from NestJS scheduling module 

import { writeFile } from 'node:fs/promises';

import { join } from 'node:path';
//business data
import { BusinessService } from '../business/business.service';
//generates excel file
import { ExcelReportService } from './excel-report.service';

@Injectable()
export class ReportScheduler{
    //NestJS Logger automatically adds time information,log level,which class 
    private readonly logger=new Logger(ReportScheduler.name,);
    //writing the services to constructor that will be used 
    constructor(
        private readonly businessService:BusinessService,
        private readonly excelReportService:ExcelReportService,
    ){}
    //no need for calling when cron is used
    @Cron(CronExpression.EVERY_WEEK)
    //every async returns a Promise 
    // a Promise without a return is void
    async createReport(): Promise<void>{
      try{  
        const businesses=await this.businessService.findAllSortedByScore();
        //Buffer is a temporary in-memory representation of binary data (such as an Excel file, PDF, or image) 
        // that can be saved, sent, or processed before being written to disk.
        const buffer=await this.excelReportService.createBusinessReport(businesses,);
        //YYYY-MM-DD format
        const date=new Date().toISOString().slice(0,10);

        const fileName =`business-report-${date}.xlsx`;
        //full path of file
        const filePath = join( process.cwd(),fileName,);

        await writeFile(filePath, buffer);

        this.logger.log( `Weekly report created: ${filePath}`,);
      }
      catch(error){
        //ERROR LOG
       this.logger.error('Weekly report could not be created',
           error instanceof Error
          ? error.stack
          : String(error), );
      }


    }


}