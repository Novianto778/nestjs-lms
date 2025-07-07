import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Response<T> = {
  data: T;
  meta?: any;
  message?: string;
  statusCode?: number;
  timestamp?: string;
};

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response: Response<any>) => {
        if (!response) {
          return {
            data: [],
            message: 'No data found',
            statusCode: 404,
            timestamp: new Date().toISOString(),
          };
        }

        if (response.data && response.meta) {
          return {
            data: response.data,
            meta: response.meta,
            message: response.message || 'Success',
            statusCode: response.statusCode || 200,
            timestamp: new Date().toISOString(),
          };
        }

        if (response.data) {
          return {
            data: response.data,
            message: response.message || 'Success',
            statusCode: response.statusCode || 200,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          data: response,
          message: 'Success',
          statusCode: 200,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
