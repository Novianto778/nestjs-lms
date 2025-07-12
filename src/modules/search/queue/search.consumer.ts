import { Process, Processor } from '@nestjs/bull';
import { LoggerService } from 'src/core/logger/logger.service';
import { SEARCH_QUEUE } from 'src/core/queue/queue.constants';
import { BaseConsumer } from '../../../core/queue/base.consumer';
import { SearchService } from '../search.service';

@Processor(SEARCH_QUEUE)
export class SearchConsumer extends BaseConsumer {
  constructor(
    logger: LoggerService,
    private readonly searchService: SearchService,
  ) {
    super(logger);
  }

  @Process(`indexAllCoursesData`)
  async indexAllCoursesData() {
    return this.searchService.indexAllCoursesData();
  }
}
