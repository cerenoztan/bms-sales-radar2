import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SmtpSettingsController } from './smtp-settings.controller';
import { SmtpSettings } from './smtp-settings.entity';
import { SmtpSettingsService } from './smtp-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SmtpSettings])],
  controllers: [SmtpSettingsController],
  providers: [SmtpSettingsService],
  exports: [SmtpSettingsService],
})
export class SettingsModule {}
