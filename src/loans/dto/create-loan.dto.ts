import { IsNumber, IsNotEmpty } from "class-validator";

export class CreateLoanDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  book_id: number;
}
