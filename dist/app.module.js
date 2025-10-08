"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const platform_express_1 = require("@nestjs/platform-express");
const path_1 = require("path");
const multer_1 = require("multer");
const mailer_1 = require("@nestjs-modules/mailer");
const pug_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/pug.adapter");
const books_module_1 = require("./modules/books/books.module");
const authors_module_1 = require("./modules/authors/authors.module");
const users_module_1 = require("./modules/users/users.module");
const loans_module_1 = require("./modules/loans/loans.module");
// import { ReviewsModule } from './modules/reviews/reviews.module';
const auth_module_1 = require("./modules/auth/auth.module");
const prisma_module_1 = require("./infrastructure/prisma/prisma.module");
const uploads_controller_1 = require("./infrastructure/uploads.controller");
const mail_module_1 = require("./infrastructure/mail/mail.module");
const nodemailer = __importStar(require("nodemailer"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mailer_1.MailerModule.forRootAsync({
                useFactory: async () => {
                    const host = process.env.SMTP_HOST || "smtp.ethereal.email";
                    const port = Number(process.env.SMTP_PORT || 587);
                    const secure = process.env.SMTP_SECURE === "true" ? true : false;
                    const user = process.env.SMTP_USER || "";
                    const pass = process.env.SMTP_PASS || "";
                    const templateDir = (0, path_1.join)(process.cwd(), "src", "infrastructure", "mail", "templates");
                    let transport;
                    if (user && pass) {
                        // Usar credenciais fornecidas
                        transport = { host, port, secure, auth: { user, pass } };
                    }
                    else {
                        // Criar conta de teste no Ethereal automaticamente
                        const testAccount = await nodemailer.createTestAccount();
                        transport = {
                            host: "smtp.ethereal.email",
                            port: 587,
                            secure: false,
                            auth: {
                                user: testAccount.user,
                                pass: testAccount.pass,
                            },
                        };
                        console.log('Conta de teste Ethereal criada:', testAccount.user);
                    }
                    return {
                        transport,
                        defaults: {
                            from: process.env.MAIL_FROM || '"PedBook" <no-reply@pedbook.local>',
                        },
                        template: {
                            dir: templateDir,
                            adapter: new pug_adapter_1.PugAdapter(),
                            options: { strict: true, cache: false },
                        },
                    };
                },
            }),
            prisma_module_1.PrismaModule,
            mail_module_1.MailModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), "FRONTEND", "uploads"),
                serveRoot: "/api/uploads",
                serveStaticOptions: {
                    cacheControl: false,
                    etag: false,
                    lastModified: false,
                    maxAge: 0,
                },
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, "..", "FRONTEND", "react-dist"),
                exclude: ["/api*", "/api/*"],
                serveStaticOptions: {
                    cacheControl: false,
                    etag: false,
                    lastModified: false,
                    maxAge: 0,
                },
            }),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        const uploadPath = (0, path_1.join)(process.cwd(), "FRONTEND", "uploads");
                        cb(null, uploadPath);
                    },
                    filename: (req, file, cb) => {
                        const filename = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}.${file.originalname.split(".").pop()}`;
                        cb(null, filename);
                    },
                }),
            }),
            books_module_1.BooksModule,
            authors_module_1.AuthorsModule,
            users_module_1.UsersModule,
            loans_module_1.LoansModule,
            auth_module_1.AuthModule,
        ],
        controllers: [uploads_controller_1.UploadsController],
    })
], AppModule);
