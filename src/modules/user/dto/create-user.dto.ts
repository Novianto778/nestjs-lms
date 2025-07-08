import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma/client';
import { IsStrongPassword } from 'src/common/decorators/strong-password.decorator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
