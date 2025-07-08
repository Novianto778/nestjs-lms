import { applyDecorators } from '@nestjs/common';
import { MinLength, Matches } from 'class-validator';

export function IsStrongPassword() {
  return applyDecorators(
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      },
    ),
  );
}
