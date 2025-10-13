import { Module } from "@nestjs/common";
import { AuthorsService } from "./authors.service";
import { AuthorsController } from "./authors.controller";
import { AuthorsRepository } from "./authors.repository";

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService, AuthorsRepository],
  exports: [AuthorsService, AuthorsRepository],
})
export class AuthorsModule {}
