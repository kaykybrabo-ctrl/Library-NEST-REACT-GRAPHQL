import { Module } from "@nestjs/common";
import { BooksService } from "./books.service";
import { BooksController } from "./books.controller";
import { BooksRepository } from "./books.repository";
import { BooksResolver } from "./books.resolver";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { CloudinaryModule } from "@/common/cloudinary/cloudinary.module";
import { AuthorsModule } from "../authors/authors.module";
import { Upload } from "@/common/scalars/upload.scalar";

@Module({
  imports: [PrismaModule, CloudinaryModule, AuthorsModule],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository, BooksResolver, Upload],
  exports: [BooksService, BooksRepository],
})
export class BooksModule {}
