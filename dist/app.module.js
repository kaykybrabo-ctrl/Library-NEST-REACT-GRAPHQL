"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const platform_express_1 = require("@nestjs/platform-express");
const path_1 = require("path");
const multer_1 = require("multer");
const books_module_1 = require("./books/books.module");
const authors_module_1 = require("./authors/authors.module");
const users_module_1 = require("./users/users.module");
const loans_module_1 = require("./loans/loans.module");
const reviews_module_1 = require("./reviews/reviews.module");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const uploads_controller_1 = require("./uploads.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'FRONTEND', 'uploads'),
                serveRoot: '/api/uploads',
                serveStaticOptions: { cacheControl: false, etag: false, lastModified: false, maxAge: 0 },
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'FRONTEND', 'react-dist'),
                exclude: ['/api*', '/api/*'],
                serveStaticOptions: { cacheControl: false, etag: false, lastModified: false, maxAge: 0 },
            }),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        const uploadPath = (0, path_1.join)(__dirname, '..', 'FRONTEND', 'uploads');
                        console.log('Multer destination path:', uploadPath);
                        cb(null, uploadPath);
                    },
                    filename: (req, file, cb) => {
                        const filename = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}.${file.originalname.split('.').pop()}`;
                        console.log('Multer filename:', filename);
                        cb(null, filename);
                    },
                }),
            }),
            books_module_1.BooksModule,
            authors_module_1.AuthorsModule,
            users_module_1.UsersModule,
            loans_module_1.LoansModule,
            reviews_module_1.ReviewsModule,
            auth_module_1.AuthModule,
        ],
        controllers: [uploads_controller_1.UploadsController],
    })
], AppModule);
