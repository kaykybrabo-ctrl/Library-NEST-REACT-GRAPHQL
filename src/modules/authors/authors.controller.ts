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
  Res,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { Response } from "express";
import { AuthorsService } from "./authors.service";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";

@Controller()
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get("authors/count")
  async count() {
    const count = await this.authorsService.count();
    return { count };
  }

  @Get("api/authors/count")
  async countApi() {
    const count = await this.authorsService.count();
    return { count };
  }

  @Get("authors/:id")
  async findOne(@Param("id") id: string, @Res() res: Response) {
    const acceptHeader = res.req.headers.accept || "";

    if (acceptHeader.includes("text/html")) {
      return res.sendFile(
        join(__dirname, "..", "..", "FRONTEND", "react-dist", "index.html"),
      );
    } else {
      const author = await this.authorsService.findOne(+id);
      return res.json(author);
    }
  }

  @Get("api/authors/:id")
  async findOneApi(@Param("id") id: string) {
    return this.authorsService.findOne(+id);
  }

  @Get("authors")
  async findAll(@Res() res: Response, @Query("includeDeleted") includeDeleted?: string) {
    const acceptHeader = res.req.headers.accept || "";

    if (acceptHeader.includes("text/html")) {
      return res.sendFile(
        join(__dirname, "..", "..", "FRONTEND", "react-dist", "index.html"),
      );
    } else {
      const authors = await this.authorsService.findAll(undefined, undefined, includeDeleted === '1' || includeDeleted === 'true');
      return res.json(authors);
    }
  }

  @Get("api/authors")
  async findAllApi(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "1000",
    @Query("includeDeleted") includeDeleted?: string,
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    return this.authorsService.findAll(pageNum, limitNum, includeDeleted === '1' || includeDeleted === 'true');
  }

  @Post("authors")
  async create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Post("api/authors")
  async createApi(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Patch("authors/:id")
  async update(
    @Param("id") id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(+id, updateAuthorDto);
  }

  @Patch("api/authors/:id")
  async updateApi(
    @Param("id") id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(+id, updateAuthorDto);
  }

  @Delete("authors/:id")
  async remove(@Param("id") id: string) {
    await this.authorsService.remove(+id);
    return { message: "Autor excluído com sucesso" };
  }

  @Delete("api/authors/:id")
  async removeApi(@Param("id") id: string) {
    await this.authorsService.remove(+id);
    return { message: "Autor excluído com sucesso" };
  }

  @Patch('authors/:id/restore')
  async restore(@Param('id') id: string) {
    await this.authorsService.restore(+id);
    return { message: 'Autor restaurado com sucesso' };
  }

  @Patch('api/authors/:id/restore')
  async restoreApi(@Param('id') id: string) {
    await this.authorsService.restore(+id);
    return { message: 'Autor restaurado com sucesso' };
  }

  @Post("authors/:id/image")
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
          return cb(new Error("Only image files are allowed!"), false);
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
      throw new Error("No file uploaded");
    }
    await this.authorsService.updatePhoto(+id, file.filename);
    return { photo: file.filename };
  }

  @Post("api/authors/:id/image")
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
          return cb(new Error("Only image files are allowed!"), false);
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
      throw new Error("No file uploaded");
    }
    try {
      await this.authorsService.updatePhoto(+id, file.filename);
      return { photo: file.filename };
    } catch (err) {
      throw err;
    }
  }
}
