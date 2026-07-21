import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './business/business.entity';
import { BusinessModule } from './business/business.module';
import { ReportModule } from './report/report.module';
import { ScoreModule } from './score/score.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Source } from './source/source.entity';
import { SourceModule } from './source/source.module';
import { CrawlerModule } from './crawler/crawler.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({isGlobal:true,}),

    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'sales-radar.sqlite',
      entities: [Business,Source],
      synchronize: true,
    }),

    BusinessModule,
    ScoreModule,
    ReportModule,
    SourceModule,
    CrawlerModule,

  ],
})
export class AppModule {}

//NetJS groups thing into modules combining them into AppModule