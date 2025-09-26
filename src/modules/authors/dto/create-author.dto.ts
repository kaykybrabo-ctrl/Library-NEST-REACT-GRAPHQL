import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  name_author: string;

  @IsString()
  @IsNotEmpty()
  biography: string;

  @IsString()
  @IsOptional()
  photo?: string;
}
