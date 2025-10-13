import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { MulterModule } from "@nestjs/platform-express";
import { join } from "path";
import { diskStorage } from "multer";
import { MailerModule } from "@nestjs-modules/mailer";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";
import { BooksModule } from "@/modules/books/books.module";
import { AuthorsModule } from "@/modules/authors/authors.module";
import { UsersModule } from "@/modules/users/users.module";
import { LoansModule } from "@/modules/loans/loans.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { ReviewsModule } from "@/modules/reviews/reviews.module";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { UploadsController } from "@/infrastructure/uploads.controller";
import { MailModule } from "@/infrastructure/mail/mail.module";
import * as nodemailer from 'nodemailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      useFactory: async () => {
        const host = process.env.SMTP_HOST || "smtp.ethereal.email";
        const port = Number(process.env.SMTP_PORT || 587);
        const secure = process.env.SMTP_SECURE === "true" ? true : false;
        const user = process.env.SMTP_USER || "";
        const pass = process.env.SMTP_PASS || "";

        const templateDir = join(process.cwd(), "src", "infrastructure", "mail", "templates");

        let transport;
        
        if (user && pass) {
          console.log('📧 Usando credenciais de email do .env');
          transport = { host, port, secure, auth: { user, pass } };
        } else {
          console.log('📧 Criando conta de teste Ethereal...');
          const testAccount = await nodemailer.createTestAccount();
          console.log('✅ Conta Ethereal criada:', testAccount.user);
          transport = {
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          };
        }

        return {
          transport,
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
      rootPath: join(process.cwd(), "FRONTEND", "uploads"),
      serveRoot: "/api/uploads",
      serveStaticOptions: {
        cacheControl: false,
        etag: false,
        lastModified: false,
        maxAge: 0,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "FRONTEND", "react-dist"),
      exclude: ["/api*", "/api/*"],
      serveStaticOptions: {
        cacheControl: false,
        etag: false,
        lastModified: false,
        maxAge: 0,
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), "FRONTEND", "uploads");
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}.${file.originalname.split(".").pop()}`;
          cb(null, filename);
        },
      }),
    }),
    BooksModule,
    AuthorsModule,
    UsersModule,
    LoansModule,
    AuthModule,
    ReviewsModule,
  ],
  controllers: [UploadsController],
})
export class AppModule {}
