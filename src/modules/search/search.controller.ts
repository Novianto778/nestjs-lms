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

  @Get('autocomplete')
  async autocomplete(@Query('q') query: string) {
    const result = await this.searchService.autocomplete(query);
    return {
      data: result,
      message: 'Autocomplete results',
    };
  }
}
