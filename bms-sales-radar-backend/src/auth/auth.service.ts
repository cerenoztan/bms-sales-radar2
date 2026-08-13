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
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
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

  const resetToken = randomBytes(32).toString('hex');
  await this.usersService.setPasswordResetToken(
    user.id,
    resetToken,
    new Date(Date.now() + 15 * 60 * 1000),
  );

  const frontendUrl =
    this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  const resetUrl =
    `${frontendUrl.replace(/\/$/, '')}/reset-password` +
    `?token=${encodeURIComponent(resetToken)}`;

  try {
    await this.mailService.sendPasswordReset(user.email, resetUrl);
  } catch (error) {
    // Hesabın sistemde bulunup bulunmadığını API yanıtından belli etmeyiz.
    console.error('Şifre sıfırlama e-postası gönderilemedi:', error);
  }

  return response;
 }
 async resetPassword(
  dto: ResetPasswordDto,
) {
  const updated = await this.usersService.resetPasswordWithToken(
    dto.token,
    dto.password,
  );
  if (!updated) {
    throw new BadRequestException(
      'Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.',
    );
  }

  return {
  message: 'Şifreniz başarıyla güncellendi.',
  };
 }
}
