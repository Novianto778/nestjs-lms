import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
