import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EnrolledGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = request.params.courseId;

    if (!user || !courseId) return false;

    const enrolled = await this.databaseService.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!enrolled)
      throw new ForbiddenException('You are not enrolled in this course');
    return true;
  }
}
