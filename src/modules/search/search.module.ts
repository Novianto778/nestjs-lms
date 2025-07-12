import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { SEARCH_QUEUE } from 'src/core/queue/queue.constants';
import { SearchProducer } from './queue/search.producer';
import { SearchConsumer } from './queue/search.consumer';

@Module({
  imports: [
    BullModule.registerQueue({ name: SEARCH_QUEUE }),
    BullBoardModule.forFeature({ name: SEARCH_QUEUE, adapter: BullAdapter }),
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
  providers: [SearchService, SearchConsumer, SearchProducer],
  exports: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
