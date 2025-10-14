import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateAuthorDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name_author: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  biography: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  photo?: string;
}
