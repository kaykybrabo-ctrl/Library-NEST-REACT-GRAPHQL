import { Module } from "@nestjs/common";
import { AuthorsService } from "./authors.service";
import { AuthorsController } from "./authors.controller";
import { AuthorsRepository } from "./authors.repository";
import { AuthorsResolver } from "./authors.resolver";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AuthorsController],
  providers: [AuthorsService, AuthorsRepository, AuthorsResolver],
  exports: [AuthorsService, AuthorsRepository],
})
export class AuthorsModule {}
