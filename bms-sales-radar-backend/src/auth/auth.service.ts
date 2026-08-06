import {
  Injectable,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async getSetupStatus() {
    return {
      setupRequired: !(await this.usersService.hasUsers()),
    };
  }

  async bootstrap(dto: CreateUserDto) {
    if (await this.usersService.hasUsers()) {
      throw new BadRequestException(
        'İlk sistem yöneticisi daha önce oluşturulmuş.',
      );
    }

    return this.usersService.create({
      ...dto,
      roleId: undefined,
      isActive: true,
    });
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findAuthUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      jobTitle: user.jobTitle,
      role: user.role
        ? { id: user.role.id, name: user.role.name }
        : null,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.usersService.update(userId, dto);
    return this.getProfile(userId);
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'E-posta veya şifre hatalı.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'E-posta veya şifre hatalı.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

   return {
  accessToken,
  user: {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    jobTitle: user.jobTitle,

    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
        }
      : null,

    permissions:
      user.role?.permissions?.map(
        (permission) => permission.key,
      ) ?? [],
       },
    };
  }
  async forgotPassword(
  dto: ForgotPasswordDto,
) {
  const email = dto.email
    .trim()
    .toLowerCase();

  const user =
    await this.usersService.findByEmail(email);

  const response = {
    message:
      'E-posta kayıtlıysa şifre yenileme bağlantısı gönderildi.',
  };

  if (!user || !user.isActive) {
    return response;
  }

  const resetToken =
    await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        purpose: 'password-reset',
      },
      {
        expiresIn: '15m',
      },
    );

  const resetUrl =
    `http://localhost:5173/reset-password` +
    `?token=${encodeURIComponent(resetToken)}`;

  // Şimdilik e-posta yerine terminalde gösteriyoruz.
  console.log('RESET PASSWORD URL:', resetUrl);

  return {
    ...response,

    // Sadece geliştirme aşamasında bırak.
    resetUrl,
  };
 }
 async resetPassword(
  dto: ResetPasswordDto,
) {
  let payload: {
    sub: number;
    email: string;
    purpose: string;
  };

  try {
    payload =
      await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        purpose: string;
      }>(dto.token);
  } catch {
    throw new BadRequestException(
      'Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.',
    );
  }

  if (payload.purpose !== 'password-reset') {
    throw new BadRequestException(
      'Geçersiz şifre yenileme bağlantısı.',
    );
  }

  const user =
    await this.usersService.findByEmail(
      payload.email,
    );

  if (
    !user ||
    !user.isActive ||
    user.id !== payload.sub
  ) {
    throw new BadRequestException(
      'Şifre yenileme bağlantısı geçersiz.',
    );
  }

  await this.usersService.updatePassword(
    user.id,
    dto.password,
  );

  return {
  message: 'Şifreniz başarıyla güncellendi.',
  };
 }
}
