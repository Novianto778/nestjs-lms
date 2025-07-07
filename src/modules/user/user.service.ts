import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { createMeta } from 'src/common/utils/pagination.utils';
import { CacheService } from 'src/core/cache/cache.service';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly cacheTtl = 60 * 5;
  private readonly cachePrefix = 'user';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async findAll(pagination: PaginationDto) {
    const { page, limit, search } = pagination;
    const cachedUsers = await this.cacheService.get<User[]>(
      `${this.cachePrefix}:all:${page}:${limit}:${search}`,
    );
    if (cachedUsers) {
      return cachedUsers;
    }

    const where = (
      search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}
    ) as Prisma.UserWhereInput;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.databaseService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.databaseService.user.count({ where }),
    ]);
    await this.cacheService.set(
      `${this.cachePrefix}:all:${page}:${limit}:${search}`,
      data,
      this.cacheTtl,
    );
    return {
      data,
      meta: createMeta({
        page,
        limit,
        total,
      }),
    };
  }

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

  async create(data: CreateUserDto) {
    const hash = await bcrypt.hash(data.password, 10);
    const user = await this.databaseService.user.create({
      data: { ...data, password: hash },
    });
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

  async update(id: string, data: UpdateUserDto) {
    const user = await this.databaseService.user.update({
      where: { id },
      data,
    });
    await this.cacheService.set(
      `${this.cachePrefix}:${user.id}`,
      user,
      this.cacheTtl,
    );
    return user;
  }

  async delete(id: string) {
    const user = await this.databaseService.user.delete({ where: { id } });
    await this.cacheService.del(`${this.cachePrefix}:${id}`);
    return user;
  }
}
