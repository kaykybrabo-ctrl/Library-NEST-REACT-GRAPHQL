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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let AuthorsService = class AuthorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAuthorDto) {
        return this.prisma.author.create({
            data: createAuthorDto,
        });
    }
    async findAll(page, limit, includeDeleted = false) {
        const whereClause = {}; // includeDeleted ? {} : { deletedAt: null };
        if (page !== undefined && limit !== undefined && page > 0 && limit > 0) {
            const offset = (page - 1) * limit;
            const [authors, total] = await Promise.all([
                this.prisma.author.findMany({
                    where: whereClause,
                    skip: offset,
                    take: limit,
                    orderBy: { author_id: "asc" },
                }),
                this.prisma.author.count({ where: whereClause }),
            ]);
            return {
                authors,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            };
        }
        const authors = await this.prisma.author.findMany({
            where: whereClause,
            orderBy: { author_id: "asc" },
        });
        return {
            authors: authors,
            total: authors.length,
            page: 1,
            limit: authors.length,
            totalPages: 1,
        };
    }
    async findOne(id) {
        return this.prisma.author.findFirst({
            where: { author_id: id },
        });
    }
    async update(id, updateAuthorDto) {
        const exists = await this.prisma.author.findFirst({ where: { author_id: id } });
        if (!exists) {
            throw new Error("Author not found");
        }
        return this.prisma.author.update({
            where: { author_id: id },
            data: updateAuthorDto,
        });
    }
    async remove(id) {
        const books = await this.prisma.book.findMany({
            where: { author_id: id },
            select: { book_id: true },
        });
        const bookIds = books.map((b) => b.book_id);
        await this.prisma.$transaction([
            this.prisma.loan.deleteMany({
                where: { book_id: { in: bookIds.length ? bookIds : [-1] } },
            }),
            this.prisma.book.deleteMany({ where: { author_id: id } }),
            this.prisma.author.delete({ where: { author_id: id } }),
        ]);
    }
    async count() {
        return this.prisma.author.count();
    }
    async updatePhoto(id, photo) {
        await this.prisma.author.update({
            where: { author_id: id },
            data: { name_author: 'temp' }, // { photo },
        });
    }
    async restore(id) {
        // Restore functionality disabled
    }
};
exports.AuthorsService = AuthorsService;
exports.AuthorsService = AuthorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthorsService);
