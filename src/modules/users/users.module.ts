import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersResolver } from "./users.resolver";
import { UsersRepository } from "./users.repository";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, "..", "..", "FRONTEND", "uploads"),
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(new Error("Only image files are allowed!"), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
