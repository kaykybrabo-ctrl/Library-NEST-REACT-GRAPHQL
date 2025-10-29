import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";
import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class CreateBookWithAuthorDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @ValidateIf((o) => !o.author_name)
  author_id?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.author_id)
  author_name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  photo?: string;
}
