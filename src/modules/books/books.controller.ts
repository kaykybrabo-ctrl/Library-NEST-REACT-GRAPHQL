import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  Req,
  ParseIntPipe
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import { BooksService } from "./books.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @Get("books/count")
  async count() {
    const count = await this.booksService.count();
    return { count };
  }

  @Get("api/books/count")
  async countApi() {
    const count = await this.booksService.count();
    return { count };
  }

  @Get("books/:id")
  async findOne(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
    const acceptHeader = req.headers.accept || "";

    if (acceptHeader.includes("text/html")) {
      return res.sendFile(
        join(__dirname, "..", "..", "FRONTEND", "react-dist", "index.html"),
      );
    } else {
      const book = await this.booksService.findOne(+id);
      return res.json(book);
    }
  }

  @Patch('books/:id/restore')
  async restore(@Param('id') id: string) {
    await this.booksService.restore(+id);
    return { message: 'Livro restaurado com sucesso' };
  }

  @Patch('api/books/:id/restore')
  async restoreApi(@Param('id') id: string) {
    await this.booksService.restore(+id);
    return { message: 'Livro restaurado com sucesso' };
  }

  @Get("books")
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("includeDeleted") includeDeleted?: string,
  ) {
    const acceptHeader = req.headers.accept || "";

    if (acceptHeader.includes("text/html")) {
      return res.sendFile(
        join(__dirname, "..", "..", "FRONTEND", "react-dist", "index.html"),
      );
    } else {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 5;
      const books = await this.booksService.findAll(pageNum, limitNum, search, includeDeleted === '1' || includeDeleted === 'true');
      return res.json(books);
    }
  }

  @Get("api/books")
  async findAllApi(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "5",
    @Query("search") search?: string,
    @Query("includeDeleted") includeDeleted?: string,
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const result = await this.booksService.findAll(pageNum, limitNum, search, includeDeleted === '1' || includeDeleted === 'true');
    return result;
  }

  @Get("api/books/:id")
  async findOneApi(@Param("id") id: string) {
    return this.booksService.findOne(+id);
  }

  @Post("books")
  async create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Post("api/books")
  async createApi(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Patch("books/:id")
  async update(@Param("id") id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Patch("api/books/:id")
  async updateApi(
    @Param("id") id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete("books/:id")
  async remove(@Param("id") id: string) {
    await this.booksService.remove(+id);
    return { message: "Livro excluído com sucesso" };
  }

  @Delete("api/books/:id")
  async removeApi(@Param("id") id: string) {
    try {
      await this.booksService.remove(+id);
      return { message: "Livro excluído com sucesso" };
    } catch (error) {
      if (error.message.includes("not found")) {
        return {
          statusCode: 404,
          message: `Livro com ID ${id} não encontrado`,
          error: "Não encontrado",
        };
      }
      throw error;
    }
  }

  @Post("books/:id/image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), "FRONTEND", "uploads");
          cb(null, uploadPath);
        },
        filename: (req, file, cb) =>
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          ),
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new Error("Apenas arquivos de imagem são permitidos!"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateImage(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error("Nenhum arquivo enviado");
    }

    await this.booksService.updatePhoto(+id, file.filename);
    return { photo: file.filename };
  }

  @Post("api/books/:id/image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), "FRONTEND", "uploads");
          cb(null, uploadPath);
        },
        filename: (req, file, cb) =>
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          ),
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new Error("Apenas arquivos de imagem são permitidos!"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateImageApi(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error("Nenhum arquivo enviado");
    }
    try {
      await this.booksService.updatePhoto(+id, file.filename);
      return { photo: file.filename };
    } catch (err) {
      throw err;
    }
  }

  @Post("api/upload-book-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./FRONTEND/uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix = uuid() + extname(file.originalname);
          cb(null, uniqueSuffix);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Apenas arquivos de imagem são permitidos"), false);
        }
      },
    }),
  )
  async uploadBookImage(
    @Body("bookId") bookId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error("Nenhum arquivo enviado");
    }
    try {
      await this.booksService.updatePhoto(+bookId, file.filename);
      return { 
        success: true,
        message: "Imagem atualizada com sucesso",
        photo: file.filename 
      };
    } catch (err) {
      throw err;
    }
  }
}
