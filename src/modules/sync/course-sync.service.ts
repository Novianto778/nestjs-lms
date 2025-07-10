import { Injectable, OnModuleInit } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class CourseSyncService implements OnModuleInit {
  constructor(
    private readonly courseRepo: CoursesService,
    private readonly search: SearchService,
  ) {}

  async onModuleInit() {
    const courses = await this.courseRepo.getAllForSearch();
    for (const course of courses) {
      await this.search.indexCourse(course);
    }

    console.log(`[Search] Synced ${courses.length} courses to Elasticsearch`);
  }
}
