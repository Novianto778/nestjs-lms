import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
