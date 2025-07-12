import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth.token ||
      client.handshake.headers['authorization']?.split(' ')[1];
    if (!token) throw new Error('Missing token');

    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('jwt.secret'),
    });
    client.data.user = payload;
    console.log(`${client.data.user.name} connected`);
  }

  handleDisconnect(client: Socket) {
    console.log(`${client.data.user.name} disconnected`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() courseId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`course-${courseId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { courseId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    const saved = await this.chatService.saveMessage({
      content: data.message,
      courseId: data.courseId,
      senderId: user.id,
    });

    this.server.to(`course-${data.courseId}`).emit('newMessage', {
      content: saved.content,
      senderId: saved.senderId,
      createdAt: saved.createdAt,
    });
  }
}
