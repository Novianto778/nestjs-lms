import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { HttpStatus } from '@nestjs/common';

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
