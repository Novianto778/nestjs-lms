import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { SearchModule } from '../search/search.module';
import { CourseSyncService } from './course-sync.service';

@Module({
  imports: [CoursesModule, SearchModule],
  providers: [CourseSyncService],
  exports: [CourseSyncService],
})
export class SyncModule {}
