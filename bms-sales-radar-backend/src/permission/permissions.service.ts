import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  Repository,
} from 'typeorm';

import { Permission } from './permission-entity';
import { Role } from '../roles/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository:
      Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository:
      Repository<Role>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findByRole(
    roleId: number,
  ): Promise<Permission[]> {
    const role =
      await this.roleRepository.findOne({
        where: {
          id: roleId,
        },
        relations: {
          permissions: true,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Rol bulunamadı.',
      );
    }

    return role.permissions;
  }

  async updateRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role =
      await this.roleRepository.findOne({
        where: {
          id: roleId,
        },
        relations: {
          permissions: true,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Rol bulunamadı.',
      );
    }

    const permissions =
      permissionIds.length === 0
        ? []
        : await this.permissionRepository.find({
            where: {
              id: In(permissionIds),
            },
          });

    if (
      permissions.length !==
      permissionIds.length
    ) {
      throw new NotFoundException(
        'Gönderilen yetkilerden biri veya birkaçı bulunamadı.',
      );
    }

    role.permissions = permissions;

    return this.roleRepository.save(role);
  }
}