import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  In,
  Repository,
} from 'typeorm';

import { Permission } from './permission.entity';
import { Role } from '../roles/role.entity';

@Injectable()
export class PermissionsService
  implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository:
      Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository:
      Repository<Role>,
  ) {}

  /**
   * NestJS uygulaması açıldıktan sonra çalışır.
   *
   * Veritabanında bulunmayan varsayılan
   * izinleri otomatik olarak oluşturur.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaults();
  }

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

  /**
   * Eksik varsayılan izinleri oluşturur.
   *
   * Mevcut izinleri değiştirmez veya silmez.
   * Aynı key'e sahip izin varsa tekrar eklemez.
   */
  private async seedDefaults(): Promise<void> {
    const defaults = [
      {
        name: 'Dashboard görüntüleme',
        key: 'DASHBOARD_VIEW',
      },
      {
        name: 'Aday keşfini görüntüleme',
        key: 'SEARCH_DISCOVERY_VIEW',
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

      if (existing) {
        continue;
      }

      const permission =
        this.permissionRepository.create({
          name: item.name,
          key: item.key,
        });

      await this.permissionRepository.save(
        permission,
      );
    }
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

    const uniquePermissionIds = [
      ...new Set(permissionIds),
    ];

    const permissions =
      uniquePermissionIds.length === 0
        ? []
        : await this.permissionRepository.find({
            where: {
              id: In(uniquePermissionIds),
            },
          });

    if (
      permissions.length !==
      uniquePermissionIds.length
    ) {
      throw new NotFoundException(
        'Gönderilen yetkilerden biri veya birkaçı bulunamadı.',
      );
    }

    role.permissions = permissions;

    return this.roleRepository.save(role);
  }
}