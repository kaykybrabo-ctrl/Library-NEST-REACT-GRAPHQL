"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const books_service_1 = require("./books.service");
const create_book_dto_1 = require("./dto/create-book.dto");
const update_book_dto_1 = require("./dto/update-book.dto");
let BooksController = class BooksController {
    booksService;
    constructor(booksService) {
        this.booksService = booksService;
    }
    async count() {
        const count = await this.booksService.count();
        return { count };
    }
    async countApi() {
        const count = await this.booksService.count();
        return { count };
    }
    async findOne(id, res) {
        const acceptHeader = res.req.headers.accept || "";
        if (acceptHeader.includes("text/html")) {
            return res.sendFile((0, path_1.join)(__dirname, "..", "..", "FRONTEND", "react-dist", "index.html"));
        }
        else {
            const book = await this.booksService.findOne(+id);
            return res.json(book);
        }
    }
    async restore(id) {
        await this.booksService.restore(+id);
        return { message: 'Livro restaurado com sucesso' };
    }
    async restoreApi(id) {
        await this.booksService.restore(+id);
        return { message: 'Livro restaurado com sucesso' };
    }
    async findAll(res, page, limit, search, includeDeleted) {
        const acceptHeader = res.req.headers.accept || "";
        if (acceptHeader.includes("text/html")) {
            return res.sendFile((0, path_1.join)(__dirname, "..", "..", "FRONTEND", "react-dist", "index.html"));
        }
        else {
            const pageNum = page ? Number(page) : 1;
            const limitNum = limit ? Number(limit) : 5;
            const books = await this.booksService.findAll(pageNum, limitNum, search, includeDeleted === '1' || includeDeleted === 'true');
            return res.json(books);
        }
    }
    async findAllApi(page = "1", limit = "5", search, includeDeleted) {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const result = await this.booksService.findAll(pageNum, limitNum, search, includeDeleted === '1' || includeDeleted === 'true');
        return result;
    }
    async findOneApi(id) {
        return this.booksService.findOne(+id);
    }
    async create(createBookDto) {
        return this.booksService.create(createBookDto);
    }
    async createApi(createBookDto) {
        return this.booksService.create(createBookDto);
    }
    async update(id, updateBookDto) {
        return this.booksService.update(+id, updateBookDto);
    }
    async updateApi(id, updateBookDto) {
        return this.booksService.update(+id, updateBookDto);
    }
    async remove(id) {
        await this.booksService.remove(+id);
        return { message: "Livro excluído com sucesso" };
    }
    async removeApi(id) {
        try {
            await this.booksService.remove(+id);
            return { message: "Livro excluído com sucesso" };
        }
        catch (error) {
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
    async updateImage(id, file) {
        if (!file) {
            throw new Error("Nenhum arquivo enviado");
        }
        await this.booksService.updatePhoto(+id, file.filename);
        return { photo: file.filename };
    }
    async updateImageApi(id, file) {
        if (!file) {
            throw new Error("Nenhum arquivo enviado");
        }
        try {
            await this.booksService.updatePhoto(+id, file.filename);
            return { photo: file.filename };
        }
        catch (err) {
            throw err;
        }
    }
};
exports.BooksController = BooksController;
__decorate([
    (0, common_1.Get)("books/count"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "count", null);
__decorate([
    (0, common_1.Get)("api/books/count"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "countApi", null);
__decorate([
    (0, common_1.Get)("books/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('books/:id/restore'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "restore", null);
__decorate([
    (0, common_1.Patch)('api/books/:id/restore'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "restoreApi", null);
__decorate([
    (0, common_1.Get)("books"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Query)("search")),
    __param(4, (0, common_1.Query)("includeDeleted")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("api/books"),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("search")),
    __param(3, (0, common_1.Query)("includeDeleted")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "findAllApi", null);
__decorate([
    (0, common_1.Get)("api/books/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "findOneApi", null);
__decorate([
    (0, common_1.Post)("books"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_book_dto_1.CreateBookDto]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("api/books"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_book_dto_1.CreateBookDto]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "createApi", null);
__decorate([
    (0, common_1.Patch)("books/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_book_dto_1.UpdateBookDto]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)("api/books/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_book_dto_1.UpdateBookDto]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "updateApi", null);
__decorate([
    (0, common_1.Delete)("books/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)("api/books/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "removeApi", null);
__decorate([
    (0, common_1.Post)("books/:id/image"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = (0, path_1.join)(process.cwd(), "FRONTEND", "uploads");
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`),
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return cb(new Error("Apenas arquivos de imagem são permitidos!"), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "updateImage", null);
__decorate([
    (0, common_1.Post)("api/books/:id/image"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = (0, path_1.join)(process.cwd(), "FRONTEND", "uploads");
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`),
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return cb(new Error("Apenas arquivos de imagem são permitidos!"), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "updateImageApi", null);
exports.BooksController = BooksController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [books_service_1.BooksService])
], BooksController);
