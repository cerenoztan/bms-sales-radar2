import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './users.entity';
import { Role } from '../roles/role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Permission } from '../permission/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Role,Permission,]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}