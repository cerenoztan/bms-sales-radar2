import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './business/business.entity';
import { BusinessModule } from './business/business.module';
import { ReportModule } from './report/report.module';
import { ScoreModule } from './score/score.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Source } from './source/source.entity';
import { SourceModule } from './source/source.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleModule } from './google/google.module';
import { CrawlerModule } from './crawler/crawler.module';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { AuthModule } from './auth/auth.module';
import { GooglePlaceEntity } from './google/entities/google-place.entity';
import { Role } from './roles/role.entity';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permission/permissions.module';
import { Permission } from './permission/permission.entity';
import { SearchKeyword } from './search-keyword/search-keyword.entity';
import { SearchKeywordModule } from './search-keyword/search-keyword.module';
import { GoogleScanRunEntity } from './google/entities/google-scan-run.entity';
import { AnalyzerModule } from './analyzer/analyzer.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({isGlobal:true,}),

    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'sales-radar.sqlite',
      entities: [Business,Source,User,GooglePlaceEntity,Role,Permission,
      SearchKeyword,GoogleScanRunEntity,
      ],
      synchronize: true,
    }),
    GoogleModule,
    BusinessModule,
    CrawlerModule,
    ScoreModule,
    ReportModule,
    SourceModule,
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    SearchKeywordModule,
    AnalyzerModule,

    
  ],
})
export class AppModule {}

//NetJS groups thing into modules combining them into AppModule
