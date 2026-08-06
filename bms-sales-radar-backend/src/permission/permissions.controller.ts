import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(
    private readonly permissionsService:
      PermissionsService,
  ) {}

  @Get('permissions')
  @RequirePermissions('PERMISSION_VIEW')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('roles/:roleId/permissions')
  @RequirePermissions('PERMISSION_VIEW')
  findByRole(
    @Param('roleId', ParseIntPipe)
    roleId: number,
  ) {
    return this.permissionsService.findByRole(
      roleId,
    );
  }
 

  @Put('roles/:roleId/permissions')
  @RequirePermissions('PERMISSION_UPDATE')
  updateRolePermissions(
    @Param('roleId', ParseIntPipe)
    roleId: number,

    @Body()
    dto: UpdateRolePermissionsDto,
  ) {
    return this.permissionsService
      .updateRolePermissions(
        roleId,
        dto.permissionIds,
      );
  }
  
}
