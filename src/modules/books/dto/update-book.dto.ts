import { PartialType } from "@nestjs/graphql";
import { CreateBookDto } from "./create-book.dto";
import { InputType } from "@nestjs/graphql";

@InputType()
export class UpdateBookDto extends PartialType(CreateBookDto) {}
