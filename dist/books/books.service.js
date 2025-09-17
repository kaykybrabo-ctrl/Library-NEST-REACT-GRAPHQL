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
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BooksService = class BooksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBookDto) {
        return this.prisma.book.create({
            data: {
                title: createBookDto.title,
                description: createBookDto.description || null,
                author_id: createBookDto.author_id,
                photo: createBookDto.photo || null,
            },
            include: {
                author: true,
            },
        });
    }
    async findAll(page, limit, search) {
        const pageNum = page || 1;
        const limitNum = limit || 5;
        const offset = (pageNum - 1) * limitNum;
        const whereClause = search ? {
            title: {
                contains: search
            }
        } : {};
        const books = await this.prisma.book.findMany({
            where: whereClause,
            skip: offset,
            take: limitNum,
            include: {
                author: true,
            },
            orderBy: {
                book_id: 'asc',
            },
        });
        const totalBooks = await this.prisma.book.count({ where: whereClause });
        const transformedBooks = books.map(book => ({
            book_id: book.book_id,
            title: book.title,
            description: book.description,
            photo: book.photo || null,
            author_name: book.author.name_author,
            author_id: book.author.author_id,
        }));
        return {
            books: transformedBooks,
            totalPages: Math.ceil(totalBooks / limitNum),
        };
    }
    async findOne(id) {
        const book = await this.prisma.book.findUnique({
            where: { book_id: id },
            include: {
                author: true,
            },
        });
        if (!book)
            return null;
        return {
            book_id: book.book_id,
            title: book.title,
            description: book.description,
            photo: book.photo || null,
            author_name: book.author.name_author,
            author_id: book.author.author_id,
        };
    }
    async update(id, updateBookDto) {
        return this.prisma.book.update({
            where: { book_id: id },
            data: {
                title: updateBookDto.title,
                description: updateBookDto.description || null,
                author_id: updateBookDto.author_id,
                photo: updateBookDto.photo || null,
            },
            include: {
                author: true,
            },
        });
    }
    async remove(id) {
        const book = await this.prisma.book.findUnique({
            where: { book_id: id },
        });
        if (!book) {
            throw new Error(`Book with ID ${id} not found`);
        }
        await this.prisma.$transaction([
            this.prisma.review.deleteMany({ where: { book_id: id } }),
            this.prisma.loan.deleteMany({ where: { book_id: id } }),
            this.prisma.book.delete({ where: { book_id: id } }),
        ]);
    }
    async count() {
        return this.prisma.book.count();
    }
    async updatePhoto(id, photo) {
        await this.prisma.book.update({
            where: { book_id: id },
            data: { photo },
        });
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BooksService);
