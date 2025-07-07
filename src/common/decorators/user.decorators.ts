import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { IUser } from 'src/common/types/user.types';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as IUser;

  if (!user) throw new UnauthorizedException('User not found');
  return user;
});
