import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { HttpStatus } from '@nestjs/common';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const response = await this.authService.register(dto);
    return {
      message: 'Successfully registered',
      data: response,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const response = await this.authService.login(dto);

    return {
      message: 'Successfully logged in',
      data: response,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const response = await this.authService.refreshToken(dto.refreshToken);
    return {
      message: 'Successfully refreshed token',
      data: response,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    await this.authService.removeRefreshToken(dto.refreshToken);
    return {
      message: 'Successfully logged out',
      data: {},
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    return {
      message: 'Successfully get profile',
      data: req.user,
      statusCode: HttpStatus.OK,
    };
  }
}
