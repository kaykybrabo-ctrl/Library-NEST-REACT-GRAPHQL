import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { diskStorage } from 'multer';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';

import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { UsersModule } from './users/users.module';
import { LoansModule } from './loans/loans.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsController } from './uploads.controller';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      useFactory: async () => {
        let host = process.env.SMTP_HOST || 'smtp.ethereal.email';
        let port = Number(process.env.SMTP_PORT || 587);
        let secure = process.env.SMTP_SECURE === 'true' ? true : false;
        let user = process.env.SMTP_USER || '';
        let pass = process.env.SMTP_PASS || '';

        if (!user || !pass) {
          const testAccount = await nodemailer.createTestAccount();
          user = testAccount.user;
          pass = testAccount.pass;
          host = 'smtp.ethereal.email';
          port = 587;
          secure = false;
          console.log('[Mail] Using Ethereal test account:', { user, pass, web: 'https://ethereal.email' });
        }

        const templateDir = join(process.cwd(), 'src', 'mail', 'templates');
        if (!fs.existsSync(templateDir)) {
          console.warn('[Mail] WARNING: mail templates directory not found at', templateDir);
        }

        return {
          transport: {
            host,
            port,
            secure,
            auth: { user, pass },
          },
          defaults: {
            from: process.env.MAIL_FROM || '"PedBook" <no-reply@pedbook.local>',
          },
          template: {
            dir: templateDir,
            adapter: new PugAdapter(),
            options: { strict: true, cache: false },
          },
        };
      },
    }),
    PrismaModule,
    MailModule,
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
