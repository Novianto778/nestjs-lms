import { Injectable, OnModuleInit } from '@nestjs/common';
import { SearchService } from '../search/search.service';

@Injectable()
export class CourseSyncService implements OnModuleInit {
  constructor(private readonly search: SearchService) {}

  async onModuleInit() {
    await this.search.backgroundIndexAllCoursesData();

    console.log(`[Search] Synced all courses to Elasticsearch`);
  }
}
