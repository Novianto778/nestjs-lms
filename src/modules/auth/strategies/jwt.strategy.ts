import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from 'generated/prisma';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly cachePrefix = 'auth';

  constructor(
    private userService: UserService,
    private cacheService: CacheService,
    config: ConfigService,
  ) {
    const secret = config.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; role: Role }) {
    const cachedToken = await this.cacheService.get<string>(
      `${this.cachePrefix}:refresh:${payload.sub}`,
    );
    if (!cachedToken) throw new UnauthorizedException('Invalid token');
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, role: user.role, email: user.email };
  }
}
