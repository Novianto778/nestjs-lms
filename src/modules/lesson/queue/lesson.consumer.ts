import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { LoggerService } from 'src/core/logger/logger.service';
import { LESSON_QUEUE } from 'src/core/queue/queue.constants';
import { BaseConsumer } from '../../../core/queue/base.consumer';
import { LessonService } from '../lesson.service';
import { UploadLessonFileDto } from '../dto/upload-lesson-file.dto';

@Processor(LESSON_QUEUE)
export class LessonConsumer extends BaseConsumer {
  constructor(
    logger: LoggerService,
    private readonly LessonService: LessonService,
  ) {
    super(logger);
  }

  @Process(`createLessonFile`)
  async createLessonFile(job: Job<UploadLessonFileDto>) {
    return this.LessonService.createLessonFile(job.data);
  }
}
