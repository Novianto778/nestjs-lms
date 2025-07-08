import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { COURSE_QUEUE } from 'src/core/queue/queue.constants';
import { UploadCourseImageDto } from '../dto/upload-course-image.dto';
import { DeleteCourseImageDto } from '../dto/delete-course-image.dto';

@Injectable()
export class CourseProducer {
  constructor(@InjectQueue(COURSE_QUEUE) private courseQueue: Queue) {}

  async uploadCourseImage(payload: UploadCourseImageDto) {
    return await this.courseQueue.add(`createCourseImage`, payload, {
      attempts: 3,
    });
  }

  async deleteCourseImage(payload: DeleteCourseImageDto) {
    return await this.courseQueue.add(`deleteCourseImage`, payload, {
      attempts: 3,
    });
  }
}
