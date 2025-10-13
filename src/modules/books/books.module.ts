import { Module } from "@nestjs/common";
import { BooksService } from "./books.service";
import { BooksController } from "./books.controller";
import { BooksRepository } from "./books.repository";

@Module({
  controllers: [BooksController],
  providers: [BooksService, BooksRepository],
  exports: [BooksService, BooksRepository],
})
export class BooksModule {}
