import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  book_id: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
