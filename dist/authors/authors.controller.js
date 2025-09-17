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
exports.AuthorsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const authors_service_1 = require("./authors.service");
const create_author_dto_1 = require("./dto/create-author.dto");
const update_author_dto_1 = require("./dto/update-author.dto");
let AuthorsController = class AuthorsController {
    authorsService;
    constructor(authorsService) {
        this.authorsService = authorsService;
    }
    async count() {
        const count = await this.authorsService.count();
        return { count };
    }
    async countApi() {
        const count = await this.authorsService.count();
        return { count };
    }
    async findOne(id, res) {
        const acceptHeader = res.req.headers.accept || '';
        if (acceptHeader.includes('text/html')) {
            return res.sendFile((0, path_1.join)(__dirname, '..', '..', 'FRONTEND', 'react-dist', 'index.html'));
        }
        else {
            const author = await this.authorsService.findOne(+id);
            return res.json(author);
        }
    }
    async findOneApi(id) {
        return this.authorsService.findOne(+id);
    }
    async findAll(res) {
        const acceptHeader = res.req.headers.accept || '';
        if (acceptHeader.includes('text/html')) {
            return res.sendFile((0, path_1.join)(__dirname, '..', '..', 'FRONTEND', 'react-dist', 'index.html'));
        }
        else {
            const authors = await this.authorsService.findAll();
            return res.json(authors);
        }
    }
    async findAllApi(page = '1', limit = '1000') {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        return this.authorsService.findAll(pageNum, limitNum);
    }
    async create(createAuthorDto) {
        return this.authorsService.create(createAuthorDto);
    }
    async createApi(createAuthorDto) {
        return this.authorsService.create(createAuthorDto);
    }
    async update(id, updateAuthorDto) {
        return this.authorsService.update(+id, updateAuthorDto);
    }
    async updateApi(id, updateAuthorDto) {
        return this.authorsService.update(+id, updateAuthorDto);
    }
    async remove(id) {
        await this.authorsService.remove(+id);
        return { message: 'Author deleted successfully' };
    }
    async removeApi(id) {
        await this.authorsService.remove(+id);
        return { message: 'Author deleted successfully' };
    }
    async updateImage(id, file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        await this.authorsService.updatePhoto(+id, file.filename);
        return { photo: file.filename };
    }
    async updateImageApi(id, file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        try {
            await this.authorsService.updatePhoto(+id, file.filename);
            return { photo: file.filename };
        }
        catch (err) {
            throw err;
        }
    }
};
exports.AuthorsController = AuthorsController;
__decorate([
    (0, common_1.Get)('authors/count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "count", null);
__decorate([
    (0, common_1.Get)('api/authors/count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "countApi", null);
__decorate([
    (0, common_1.Get)('authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('api/authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "findOneApi", null);
__decorate([
    (0, common_1.Get)('authors'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('api/authors'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "findAllApi", null);
__decorate([
    (0, common_1.Post)('authors'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_author_dto_1.CreateAuthorDto]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('api/authors'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_author_dto_1.CreateAuthorDto]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "createApi", null);
__decorate([
    (0, common_1.Patch)('authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_author_dto_1.UpdateAuthorDto]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('api/authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_author_dto_1.UpdateAuthorDto]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "updateApi", null);
__decorate([
    (0, common_1.Delete)('authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('api/authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "removeApi", null);
__decorate([
    (0, common_1.Post)('authors/:id/image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => cb(null, (0, path_1.join)(__dirname, '..', '..', 'FRONTEND', 'uploads')),
            filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`),
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "updateImage", null);
__decorate([
    (0, common_1.Post)('api/authors/:id/image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => cb(null, (0, path_1.join)(__dirname, '..', '..', 'FRONTEND', 'uploads')),
            filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`),
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthorsController.prototype, "updateImageApi", null);
exports.AuthorsController = AuthorsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [authors_service_1.AuthorsService])
], AuthorsController);
