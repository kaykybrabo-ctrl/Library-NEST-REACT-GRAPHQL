import { PartialType } from "@nestjs/graphql";
import { CreateAuthorDto } from "./create-author.dto";
import { InputType } from "@nestjs/graphql";

@InputType()
export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}
