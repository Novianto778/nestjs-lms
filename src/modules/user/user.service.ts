import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { CacheService } from 'src/core/cache/cache.service';
import { DatabaseService } from 'src/database/database.service';

// src/user/user.service.ts
@Injectable()
export class UserService {
  private readonly cacheTtl = 60 * 60 * 24;
  private readonly cachePrefix = 'user';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async findByEmail(email: string) {
    const cachedUser = await this.cacheService.get<User>(email);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (user) {
      await this.cacheService.set(
        `${this.cachePrefix}:${user.id}`,
        user,
        this.cacheTtl,
      );
    }
    return user;
  }

  async create(data: { email: string; password: string; name: string }) {
    const user = await this.databaseService.user.create({ data });
    await this.cacheService.set(
      `${this.cachePrefix}:${user.id}`,
      user,
      this.cacheTtl,
    );
    return user;
  }

  async findById(id: string) {
    const cachedUser = await this.cacheService.get<User>(
      `${this.cachePrefix}:${id}`,
    );
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (user) {
      await this.cacheService.set(
        `${this.cachePrefix}:${id}`,
        user,
        this.cacheTtl,
      );
    }
    return user;
  }
}
