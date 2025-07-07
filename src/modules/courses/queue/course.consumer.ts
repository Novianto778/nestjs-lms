import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { LoggerService } from 'src/core/logger/logger.service';
import { COURSE_QUEUE } from 'src/core/queue/queue.constants';
import { BaseConsumer } from './base.consumer';
import { UploadCourseImageDto } from '../dto/upload-course-image.dto';
import { CoursesService } from '../courses.service';

@Processor(COURSE_QUEUE)
export class CourseConsumer extends BaseConsumer {
  constructor(
    logger: LoggerService,
    private readonly courseService: CoursesService,
  ) {
    super(logger);
  }

  @Process(`createCourseImage`)
  async createCourseImage(job: Job<UploadCourseImageDto>) {
    return this.courseService.createCourseImage(job.data);
  }

  // if want override error handler
  //   @OnQueueFailed()
  //   onError(job: Job<string>, error: any) {
  //     super.onError(job, error);
  //     // do something else here
  //   }
}
