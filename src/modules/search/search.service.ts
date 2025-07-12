import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { DatabaseService } from 'src/database/database.service';
import { COURSE_INDEX, courseMapping } from './mapping/course.mapping';
import { SearchProducer } from './queue/search.producer';

@Injectable()
export class SearchService {
  private readonly index = COURSE_INDEX;

  constructor(
    private readonly es: ElasticsearchService,
    private readonly databaseService: DatabaseService,
    private readonly searchProducer: SearchProducer,
  ) {}

  async createIndex() {
    const exists = await this.es.indices.exists({ index: this.index });

    if (!exists) {
      await this.es.indices.create({
        index: this.index,
        mappings: courseMapping,
      });
    }
  }

  async backgroundIndexAllCoursesData() {
    await this.searchProducer.indexAllCoursesData();
  }

  async indexAllCoursesData() {
    await this.createIndex();
    const courses = await this.databaseService.course.findMany({
      include: {
        instructor: true,
      },
    });
    for (const course of courses) {
      await this.indexCourse({
        id: course.id,
        title: course.title,
        description: course.description,
        instructorName: course.instructor.name,
        price: course.price,
        isPublished: course.isPublished,
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
    const document = {
      ...course,
      title_suggest: {
        input: [course.title],
      },
    };
    await this.es.index({
      index: this.index,
      id: course.id,
      document,
    });
  }

  async updateCourse(courseId: string, data: Partial<any>) {
    const updateDoc: Record<string, any> = { ...data };

    if (data.title) {
      updateDoc.title_suggest = {
        input: [
          data.title,
          ...data.title.split(' ').filter((w: string) => w.length > 2),
        ],
      };
    }

    await this.es.update({
      index: this.index,
      id: courseId,
      doc: updateDoc,
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

  async deleteCourseIndex() {
    await this.es.indices.delete({ index: this.index });
  }

  async reindexCourses() {
    await this.deleteCourseIndex(); // Clean slate
    await this.backgroundIndexAllCoursesData();
    return { status: 'reindexed' };
  }

  async autocomplete(query: string) {
    const result = await this.es.search({
      index: this.index,
      size: 0, // Turn off normal results, useful when only using .suggest
      suggest: {
        title_suggest: {
          prefix: query,
          completion: {
            // skip_duplicates: true,
            field: 'title_suggest',
            size: 10,
          },
        },
      },
    });

    const suggestions = (result.suggest?.title_suggest?.[0]?.options ||
      []) as any;

    return suggestions?.map((suggestion: any) => ({
      id: suggestion._source.id,
      title: suggestion._source.title,
    }));
  }
}
