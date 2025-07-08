import { Role } from 'generated/prisma';
import { SetMetadata } from '@nestjs/common';

export interface RolesMetadata {
  roles: Role[];
  message?: string;
}

export const Roles = (roles: Role[], message?: string) =>
  SetMetadata('roles', {
    roles,
    message,
  });
