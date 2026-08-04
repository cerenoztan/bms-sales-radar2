import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  Repository,
} from 'typeorm';

import { Permission } from './permission.entity';
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

  async seedDefaults(): Promise<Permission[]> {
  const defaults = [
    {
      name: 'Dashboard görüntüleme',
      key: 'DASHBOARD_VIEW',
    },
    {
      name: 'Kullanıcıları görüntüleme',
      key: 'USER_VIEW',
    },
    {
      name: 'Kullanıcı oluşturma',
      key: 'USER_CREATE',
    },
    {
      name: 'Kullanıcı güncelleme',
      key: 'USER_UPDATE',
    },
    {
      name: 'Kullanıcı silme',
      key: 'USER_DELETE',
    },
    {
      name: 'Rolleri görüntüleme',
      key: 'ROLE_VIEW',
    },
    {
      name: 'Rol oluşturma',
      key: 'ROLE_CREATE',
    },
    {
      name: 'Rol güncelleme',
      key: 'ROLE_UPDATE',
    },
    {
      name: 'Rol silme',
      key: 'ROLE_DELETE',
    },
    {
      name: 'Yetkilendirmeyi görüntüleme',
      key: 'PERMISSION_VIEW',
    },
    {
      name: 'Yetkilendirmeyi güncelleme',
      key: 'PERMISSION_UPDATE',
    },
    {
      name: 'Raporları görüntüleme',
      key: 'REPORT_VIEW',
    },
  ];

  for (const item of defaults) {
    const existing =
      await this.permissionRepository.findOne({
        where: {
          key: item.key,
        },
      });

    if (!existing) {
      await this.permissionRepository.save(
        this.permissionRepository.create(item),
      );
    }
  }

  return this.findAll();
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