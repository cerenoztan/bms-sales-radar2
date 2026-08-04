import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository:
      Repository<Role>,
  ) {}

  async create(
    dto: CreateRoleDto,
  ): Promise<Role> {
    const name = dto.name.trim();

    if (!name) {
      throw new ConflictException(
        'Rol adı zorunludur.',
      );
    }

    const existingRole =
      await this.roleRepository.findOne({
        where: {
          name,
        },
      });

    if (existingRole) {
      throw new ConflictException(
        'Bu rol kodu zaten kullanılıyor.',
      );
    }

    const role =
      this.roleRepository.create({
        name,
        isActive:
          dto.isActive ?? true,
      });

    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
  ): Promise<Role> {
    const role =
      await this.roleRepository.findOne({
        where: {
          id,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Rol bulunamadı.',
      );
    }

    return role;
  }

  async update(
    id: number,
    dto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new ConflictException(
          'Rol adı boş bırakılamaz.',
        );
      }

      role.name = name;
    }

    

    if (dto.isActive !== undefined) {
      role.isActive = dto.isActive;
    }

    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role =
      await this.roleRepository.findOne({
        where: {
          id,
        },
        relations: {
          users: true,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Rol bulunamadı.',
      );
    }

    /*
     * Rol kullanıcılar tarafından kullanılıyorsa
     * yanlışlıkla silinmesini engelliyoruz.
     */
    if (role.users.length > 0) {
      throw new ConflictException(
        'Bu rol kullanıcılara atanmış olduğu için silinemez.',
      );
    }

    await this.roleRepository.remove(role);
  }

  private normalizeCode(
    value: string,
  ): string {
    return value
      .trim()
      .toLocaleUpperCase('tr-TR')
  }
}