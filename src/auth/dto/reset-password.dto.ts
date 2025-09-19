import { IsOptional, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsOptional()
  @IsString()
  token?: string;
  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(3)
  newPassword!: string;
}
