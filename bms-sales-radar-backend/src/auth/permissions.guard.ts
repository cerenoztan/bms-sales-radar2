import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  REQUIRED_PERMISSIONS_KEY,
} from './require-permissions.decorator';
import { User } from '../users/users.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (user?.role?.name === 'Sistem Yöneticisi') {
      return true;
    }

    const userPermissions = new Set(
      user?.role?.permissions?.map((permission) => permission.key) ?? [],
    );

    if (requiredPermissions.every((item) => userPermissions.has(item))) {
      return true;
    }

    throw new ForbiddenException('Bu işlem için yetkiniz bulunmuyor.');
  }
}
