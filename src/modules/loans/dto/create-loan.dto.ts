import { IsNumber, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLoanDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  book_id: number;

  @IsOptional()
  @IsString()
  due_date?: string;
}
