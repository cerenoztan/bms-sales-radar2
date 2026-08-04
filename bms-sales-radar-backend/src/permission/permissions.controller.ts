import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Controller()
export class PermissionsController {
  constructor(
    private readonly permissionsService:
      PermissionsService,
  ) {}

  @Get('permissions')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('roles/:roleId/permissions')
  findByRole(
    @Param('roleId', ParseIntPipe)
    roleId: number,
  ) {
    return this.permissionsService.findByRole(
      roleId,
    );
  }

  @Put('roles/:roleId/permissions')
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