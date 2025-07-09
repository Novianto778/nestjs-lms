import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { LESSON_QUEUE } from 'src/core/queue/queue.constants';
import { UploadLessonFileDto } from '../dto/upload-lesson-file.dto';

@Injectable()
export class LessonProducer {
  constructor(@InjectQueue(LESSON_QUEUE) private courseQueue: Queue) {}

  async uploadLessonFile(payload: UploadLessonFileDto) {
    return await this.courseQueue.add(`createLessonFile`, payload, {
      attempts: 3,
    });
  }
}
