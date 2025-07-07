import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'generated/prisma/client';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/core/cache/cache.service';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
  private readonly cachePrefix = 'auth';

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
    private cacheService: CacheService,
  ) {}

  private getCacheTtl(): number {
    return ms(
      this.config.get<string>('jwt.refreshTokenExpiresIn') as StringValue,
    );
  }

  async register(dto: RegisterDto) {
    const exists = await this.userService.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email already exists');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({ ...dto, password: hash });
    const payload = this.signPayload(user);

    await this.cacheService.set(
      `${this.cachePrefix}:refresh:${user.id}`,
      payload,
      this.getCacheTtl(),
    );
    return payload;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = this.signPayload(user);
    await this.cacheService.set(
      `${this.cachePrefix}:refresh:${user.id}`,
      payload,
      this.getCacheTtl(),
    );
    return payload;
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.config.get('jwt.refreshTokenSecret'),
    });
    if (!payload) throw new UnauthorizedException('Invalid token');

    const cachedToken = await this.cacheService.get<string>(
      `${this.cachePrefix}:refresh:${payload.sub}`,
    );
    if (!cachedToken) throw new UnauthorizedException('Invalid token');

    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    const response = this.signPayload(user);
    await this.cacheService.set(
      `${this.cachePrefix}:refresh:${user.id}`,
      response,
      this.getCacheTtl(),
    );
    return response;
  }

  async removeRefreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.config.get('jwt.refreshTokenSecret'),
    });
    if (!payload) throw new UnauthorizedException('Invalid token');
    // find the token in the cache
    const cachedToken = await this.cacheService.get<string>(
      `${this.cachePrefix}:refresh:${payload.sub}`,
    );

    if (!cachedToken) throw new UnauthorizedException('Invalid token');

    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    await this.cacheService.del(`${this.cachePrefix}:refresh:${user.id}`);
  }

  private signPayload(user: User) {
    return {
      tokens: {
        accessToken: this.generateAccessToken(user),
        refreshToken: this.generateRefreshToken(user),
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private generateAccessToken(user: User) {
    const payload = { sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      expiresIn: this.config.get('jwt.expiresIn'),
      secret: this.config.get('jwt.secret'),
    });
  }

  private generateRefreshToken(user: User) {
    const payload = { sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      expiresIn: this.config.get('jwt.refreshTokenExpiresIn'),
      secret: this.config.get('jwt.refreshTokenSecret'),
    });
  }
}
