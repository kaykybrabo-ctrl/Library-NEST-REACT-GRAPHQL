import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import session from "express-session";
import { AppModule } from "./app.module";
import * as bodyParser from 'body-parser';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        skipMissingProperties: false,
        disableErrorMessages: false,
      }),
    );

    app.enableCors({
      origin: true,
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      allowedHeaders: "Authorization,Content-Type",
    });

    app.use(
      session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
      }),
    );

    const port = process.env.PORT || 8083;
    await app.listen(port, "0.0.0.0");
  } catch (error) {
    process.exit(1);
  }
}

bootstrap();
