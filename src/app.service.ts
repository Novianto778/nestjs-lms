import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './core/cache/cache.service';

@Injectable()
export class AppService {
  constructor(
    private readonly config: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async getHello(): Promise<string> {
    const cachedValue = await this.cacheService.get<string>('hello');
    if (cachedValue) {
      return cachedValue + ' (cached)';
    }
    const value = this.config.get<string>('environment') + 'Hello World!';
    await this.cacheService.set('hello', value);
    return value;
  }
}
