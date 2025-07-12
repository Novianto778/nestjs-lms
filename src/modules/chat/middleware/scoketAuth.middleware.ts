import { Socket } from 'socket.io';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

export function socketAuthMiddleware(jwtService: JwtService) {
  return async (socket: Socket, next: (err?: any) => void) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers['authorization']?.split(' ')[1];
      console.log(token);
      const payload = jwtService.verify(token);
      console.log(payload);
      socket.data.user = payload; // attach to socket
      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        next(new Error('Token expired'));
      }
      next(new Error('Unauthorized'));
    }
  };
}
