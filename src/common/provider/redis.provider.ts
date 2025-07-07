import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const RedisClientProvider: Provider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Redis({
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
      username: configService.get('redis.username'),
      password: configService.get('redis.password'),
    });
  },
};
