import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class CreateBookDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int)
  @IsNumber()
  author_id: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  photo?: string;
}
