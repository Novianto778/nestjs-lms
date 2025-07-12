import { Controller } from '@nestjs/common';
import { SearchService } from './search.service';
import { Get, Query } from '@nestjs/common';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    const result = await this.searchService.searchCourses(query);
    return {
      data: result,
      message: 'Search results',
    };
  }

  @Get('reindex')
  async reindex() {
    const result = await this.searchService.reindexCourses();
    return {
      data: result,
      message: 'Reindex results',
    };
  }

  @Get('create-index')
  async createIndex() {
    await this.searchService.createIndex();
    return {
      message: 'Index created',
    };
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') query: string) {
    const result = await this.searchService.autocomplete(query);
    return {
      data: result,
      message: 'Autocomplete results',
    };
  }

  @Get('delete-index')
  async deleteIndex() {
    await this.searchService.deleteCourseIndex();
    return {
      message: 'Index deleted',
    };
  }

  @Get('index-all-courses')
  async indexAllCourses() {
    await this.searchService.indexAllCoursesData();
    return {
      message: 'All courses indexed',
    };
  }
}
