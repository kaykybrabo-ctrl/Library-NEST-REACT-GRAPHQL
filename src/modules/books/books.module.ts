import { Module } from "@nestjs/common";
import { BooksService } from "./books.service";
import { BooksController } from "./books.controller";
import { BooksRepository } from "./books.repository";
import { BooksResolver } from "./books.resolver";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BooksController], // REST continua funcionando
  providers: [BooksService, BooksRepository, BooksResolver], // ← Resolver adicionado
  exports: [BooksService, BooksRepository],
})
export class BooksModule {}
