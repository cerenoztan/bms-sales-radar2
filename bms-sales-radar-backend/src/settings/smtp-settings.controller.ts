import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { UpdateSmtpSettingsDto } from './dto/update-smtp-settings.dto';
import { SmtpSettingsService } from './smtp-settings.service';

@Controller('settings/smtp')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('SETTINGS_MANAGE')
export class SmtpSettingsController {
  constructor(private readonly service: SmtpSettingsService) {}

  @Get()
  getSettings() {
    return this.service.getPublicSettings();
  }

  @Patch()
  update(@Body() dto: UpdateSmtpSettingsDto) {
    return this.service.update(dto);
  }
}
