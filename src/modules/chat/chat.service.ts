import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChatService {
  constructor(private databaseService: DatabaseService) {}

  async saveMessage(data: {
    content: string;
    senderId: string;
    courseId: string;
  }) {
    return this.databaseService.chatMessage.create({
      data,
    });
  }

  async getMessages(courseId: string) {
    return this.databaseService.chatMessage.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
