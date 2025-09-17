import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { diskStorage } from 'multer';

import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { UsersModule } from './users/users.module';
import { LoansModule } from './loans/loans.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'FRONTEND', 'uploads'),
      serveRoot: '/api/uploads',
      serveStaticOptions: { cacheControl: false, etag: false, lastModified: false, maxAge: 0 },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'FRONTEND', 'react-dist'),
      exclude: ['/api*', '/api/*'],
      serveStaticOptions: { cacheControl: false, etag: false, lastModified: false, maxAge: 0 },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '..', 'FRONTEND', 'uploads');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}.${file.originalname.split('.').pop()}`;
          cb(null, filename);
        },
      }),
    }),
    BooksModule,
    AuthorsModule,
    UsersModule,
    LoansModule,
    ReviewsModule,
    AuthModule,
  ],
  controllers: [UploadsController],
})
export class AppModule {}
