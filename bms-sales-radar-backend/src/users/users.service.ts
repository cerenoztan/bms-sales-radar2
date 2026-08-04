import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Permission } from '../permission/permission.entity';
import { User} from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    
  ) {}

  async create(
    dto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const normalizedEmail = dto.email
      .trim()
      .toLocaleLowerCase('tr-TR');

    const existingUser =
      await this.userRepository.findOne({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Bu e-posta adresi zaten kullanılıyor.',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      12,
    );

    const userCount = await this.userRepository.count();

    const isFirstUser = userCount === 0;

   let role: Role | undefined;

if (isFirstUser) {
  const permissions =
    await this.permissionRepository.find();

  let adminRole =
    await this.roleRepository.findOne({
      where: {
        name: 'Sistem Yöneticisi',
      },
      relations: {
        permissions: true,
      },
    });

  if (!adminRole) {
    adminRole =
      this.roleRepository.create({
        name: 'Sistem Yöneticisi',
        isActive: true,
        permissions,
      });
  } else {
    adminRole.permissions = permissions;
  }

  adminRole =
    await this.roleRepository.save(adminRole);

  role = adminRole;
  } else {
  if (dto.roleId === undefined) {
    throw new NotFoundException(
      'Rol seçilmelidir.',
    );
  }

  const foundRole =
    await this.roleRepository.findOneBy({
      id: dto.roleId,
    });

  if (!foundRole) {
    throw new NotFoundException(
      'Rol bulunamadı.',
    );
  }

    role = foundRole;
  }


    const user = this.userRepository.create({
      fullName: dto.fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      jobTitle:dto.jobTitle,
      isActive: dto.isActive ?? true,
    });

    const savedUser =
      await this.userRepository.save(user);

    return this.removePasswordHash(savedUser);
  }

  async findAll(): Promise<
    Array<Omit<User, 'passwordHash'>>
  > {
    const users = await this.userRepository.find({
      relations:{
        role :true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) =>
      this.removePasswordHash(user),
    );
  }

  async findOne(
    id: number,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findEntityById(id);

    return this.removePasswordHash(user);
  }

  async findByEmail(
  email: string,
  ): Promise<User | null> {
  return this.userRepository.findOne({
    where: {
      email: email
        .trim()
        .toLocaleLowerCase('tr-TR'),
    },
    relations: {
      role: {
        permissions: true,
      },
    },
    });
  }

  async update(
    id: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findEntityById(id);

    if (dto.email) {
      const normalizedEmail = dto.email
        .trim()
        .toLocaleLowerCase('tr-TR');

      const existingUser =
        await this.userRepository.findOne({
          where: {
            email: normalizedEmail,
          },
        });

      if (
        existingUser &&
        existingUser.id !== id
      ) {
        throw new ConflictException(
          'Bu e-posta adresi zaten kullanılıyor.',
        );
      }

      user.email = normalizedEmail;
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName.trim();
    }
    if (dto.jobTitle !== undefined) {
      user.jobTitle = dto.jobTitle.trim();
    }

    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(
        dto.password,
        12,
      );
    }

    if (dto.roleId !== undefined) {
      if (dto.roleId === null) {
    user.role = undefined;
    } else {
    const role =
      await this.roleRepository.findOneBy({
        id: dto.roleId,
      });

    if (!role) {
      throw new NotFoundException(
        'Rol bulunamadı.',
      );
    }

     user.role = role;
       }
    }

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }

    const updatedUser =
      await this.userRepository.save(user);

    return this.removePasswordHash(updatedUser);
  }
  async updatePassword(
  id: number,
  password: string,
  ): Promise<void> {
  const user = await this.findEntityById(id);

  user.passwordHash = await bcrypt.hash(
    password,
    12,
  );

  await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findEntityById(id);

    await this.userRepository.remove(user);
  }

  private async findEntityById(
    id: number,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations:{
        role:true,
      }
    });

    if (!user) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    return user;
  }
  private removePasswordHash(
    user: User,
  ): Omit<User, 'passwordHash'> {
    const {
      passwordHash: _passwordHash,
      ...safeUser
    } = user;

    return safeUser;
  }
}