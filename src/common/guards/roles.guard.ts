import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesMetadata } from '../decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<RolesMetadata>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const { roles, message } = metadata;
    if (!roles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        message || 'You are not authorized to access this resource',
      );
    }

    return true;
  }
}
