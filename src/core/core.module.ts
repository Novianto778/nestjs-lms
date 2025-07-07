import {
  RequestMethod,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from 'src/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/transform-response/transform-response.interceptor';
import { LoggerService } from './logger/logger.service';
import { LoggerMiddleware } from './logger/logger.middleware';
import { DatabaseModule } from 'src/database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache/cache.service';
import { AllExceptionsFilter } from './filter/all-exceptions.filter';
import { redisStore } from 'cache-manager-redis-store';
import { RedisClientProvider } from 'src/common/provider/redis.provider';

@Global() // Make this module global so all modules can use it without importing it
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        username: configService.get('redis.username'),
        password: configService.get('redis.password'),
        no_ready_check: true,
        ttl: 10,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    RedisClientProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    LoggerService,
    CacheService,
  ],
  exports: [LoggerService, CacheService, 'REDIS_CLIENT'],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      method: RequestMethod.ALL,
      path: '*',
    });
  }
}
