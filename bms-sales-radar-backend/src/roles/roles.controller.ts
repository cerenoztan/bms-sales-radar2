import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService:
      RolesService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateRoleDto,
  ) {
    return this.rolesService.create(dto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
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