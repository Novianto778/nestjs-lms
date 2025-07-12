import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SEARCH_QUEUE } from 'src/core/queue/queue.constants';

@Injectable()
export class SearchProducer {
  constructor(@InjectQueue(SEARCH_QUEUE) private searchQueue: Queue) {}

  async indexAllCoursesData() {
    return await this.searchQueue.add(
      `indexAllCoursesData`,
      {},
      {
        attempts: 3,
      },
    );
  }
}
