import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  private readonly index = 'courses';

  constructor(private readonly es: ElasticsearchService) {}

  async createIndex() {
    const exists = await this.es.indices.exists({ index: this.index });
    if (!exists) {
      await this.es.indices.create({
        index: this.index,
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text' },
            description: { type: 'text' },
            instructorName: { type: 'text' },
            price: { type: 'integer' },
            isPublished: { type: 'boolean' },
          },
        },
      });
    }
  }

  async indexCourse(course: {
    id: string;
    title: string;
    description: string;
    instructorName: string;
    price: number;
    isPublished: boolean;
  }) {
    await this.es.index({
      index: this.index,
      id: course.id,
      document: course,
    });
  }

  async updateCourse(courseId: string, data: Partial<any>) {
    await this.es.update({
      index: this.index,
      id: courseId,
      doc: data,
    });
  }

  async removeCourse(courseId: string) {
    await this.es.delete({ index: this.index, id: courseId });
  }

  async searchCourses(query: string) {
    const result = await this.es.search({
      index: this.index,
      query: {
        multi_match: {
          query,
          fields: ['title^3', 'description', 'instructorName'],
          fuzziness: 'auto',
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source);
  }

  async autocomplete(query: string) {
    const result = await this.es.search({
      index: this.index,
      size: 5,
      query: {
        match_phrase_prefix: {
          title: query,
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source);
  }
}
