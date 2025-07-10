import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { createMeta } from 'src/common/utils/pagination.utils';
import { slugify } from 'src/common/utils/slug.utils';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.services';
import { v4 as uuidv4 } from 'uuid';
import { FileService } from '../utilities/file/file.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { DeleteCourseImageDto } from './dto/delete-course-image.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UploadCourseImageDto } from './dto/upload-course-image.dto';
import { CourseProducer } from './queue/course.producer';
import { SearchService } from '../search/search.service';

@Injectable()
export class CoursesService {
  constructor(
    private databaseService: DatabaseService,
    private cloudinaryService: CloudinaryService,
    private fileService: FileService,
    private courseProducer: CourseProducer,
    private searchService: SearchService,
  ) {}

  async getAllForSearch() {
    const courses = await this.databaseService.course.findMany({
      where: { isPublished: true }, // optional filter
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructorName: course.instructor.name,
      price: course.price,
      isPublished: course.isPublished,
    }));
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      this.databaseService.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { instructor: true },
      }),
      this.databaseService.course.count({ where }),
    ]);

    return {
      message: 'Courses fetched',
      data,
      meta: createMeta({ page, limit, total }),
    };
  }

  async findOne(id: string) {
    return this.databaseService.course.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.databaseService.course.findUnique({ where: { slug } });
  }

  async create(data: CreateCourseDto, images: Express.Multer.File[]) {
    let slug = slugify(data.title);
    // check if course with slug already exists, add increment number to slug
    const currentCourse = await this.databaseService.course.findUnique({
      where: { slug },
    });
    const uuid = uuidv4();
    if (currentCourse) {
      slug = `${slug}-${uuid}`;
    }
    const thumbnailUrl = images.length > 0 ? 'processing' : null;
    const course = await this.databaseService.course.create({
      data: { ...data, slug, thumbnailUrl },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const image of images) {
      await this.courseProducer.uploadCourseImage({
        base64File: this.fileService.bufferToBase64(image.buffer),
        mimeType: image.mimetype,
        courseId: course.id,
      });
    }

    // Sync the update to Elasticsearch
    await this.searchService.indexCourse({
      id: course.id,
      title: course.title,
      description: course.description,
      instructorName: course.instructor.name,
      price: course.price,
      isPublished: course.isPublished,
    });

    return course;
  }

  async createCourseImage({ base64File, courseId }: UploadCourseImageDto) {
    const buffer = this.fileService.base64ToBuffer(base64File);
    const result = await this.cloudinaryService.uploadImage(buffer);

    return this.databaseService.course.update({
      where: { id: courseId },
      data: {
        thumbnailUrl: result.secure_url,
        thumb_public_id: result.public_id,
      },
    });
  }

  async deleteCourseImage({ courseId }: DeleteCourseImageDto) {
    const course = await this.databaseService.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.thumb_public_id)
      throw new NotFoundException('Course image not found');

    await this.cloudinaryService.deleteImage(course.thumb_public_id);
    return this.databaseService.course.update({
      where: { id: courseId },
      data: {
        thumbnailUrl: null,
        thumb_public_id: null,
      },
    });
  }

  async update(
    id: string,
    data: UpdateCourseDto,
    images: Express.Multer.File[],
  ) {
    const course = await this.databaseService.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const image of images) {
      await this.courseProducer.uploadCourseImage({
        base64File: this.fileService.bufferToBase64(image.buffer),
        mimeType: image.mimetype,
        courseId: course.id,
      });
    }

    // Sync the update to Elasticsearch
    await this.searchService.indexCourse({
      id: course.id,
      title: course.title,
      description: course.description,
      instructorName: course.instructor.name,
      price: course.price,
      isPublished: course.isPublished,
    });

    return course;
  }

  async delete(id: string) {
    await this.courseProducer.deleteCourseImage({
      courseId: id,
    });

    await this.databaseService.course.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    // Sync the delete to Elasticsearch
    await this.searchService.removeCourse(id);

    return {
      courseId: id,
    };
  }

  async setPublished(id: string, isPublished: boolean) {
    return this.databaseService.course.update({
      where: { id },
      data: { isPublished },
    });
  }

  async instructorCourses(instructorId: string) {
    return this.databaseService.course.findMany({
      where: { instructorId },
    });
  }
}
