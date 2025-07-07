import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma/client';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
