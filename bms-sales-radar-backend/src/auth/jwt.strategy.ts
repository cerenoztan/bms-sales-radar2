import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../users/users.service';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ??
        'bms-sales-radar-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findAuthUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Kullanıcı oturumu geçersiz.');
    }

    return user;
  }
}
