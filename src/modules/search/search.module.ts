import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        node: config.get<string>('elasticsearch.node'),
        auth: {
          username: config.get<string>('elasticsearch.username') as string,
          password: config.get<string>('elasticsearch.password') as string,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
