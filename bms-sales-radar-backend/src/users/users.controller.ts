import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { User } from './users.entity';
import { BadRequestException } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @RequirePermissions('USER_CREATE')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermissions('USER_VIEW')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('USER_VIEW')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('USER_UPDATE')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('USER_DELETE')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request & { user: User },
  ) {
    if (request.user.id === id) {
      throw new BadRequestException(
        'Kendi kullanıcı hesabınızı silemezsiniz.',
      );
    }
    await this.usersService.remove(id);

    return {
      message: 'Kullanıcı silindi.',
    };
  }
}
