import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(
    private readonly rolesService:
      RolesService,
  ) {}

  @Post()
  @RequirePermissions('ROLE_CREATE')
  create(
    @Body()
    dto: CreateRoleDto,
  ) {
    return this.rolesService.create(dto);
  }

  @Get()
  @RequirePermissions('ROLE_VIEW')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('ROLE_VIEW')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('ROLE_UPDATE')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @RequirePermissions('ROLE_DELETE')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    await this.rolesService.remove(id);

    return {
      message: 'Rol silindi.',
    };
  }
}
