import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  password: string;
}
