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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createReviewDto) {
        const bookExists = await this.checkBookExists(createReviewDto.book_id);
        const userExists = await this.checkUserExists(createReviewDto.user_id);
        if (!bookExists) {
            throw new common_1.NotFoundException('Book not found');
        }
        if (!userExists) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.review.create({
            data: createReviewDto,
            include: {
                user: true,
                book: true,
            },
        });
    }
    async findAll() {
        const reviews = await this.prisma.review.findMany({
            include: {
                user: true,
                book: true,
            },
            orderBy: {
                review_date: 'desc',
            },
        });
        return reviews.map(review => ({
            review_id: review.review_id,
            book_id: review.book_id,
            user_id: review.user_id,
            rating: review.rating,
            comment: review.comment,
            review_date: review.review_date,
            username: review.user.username,
            bookTitle: review.book.title,
        }));
    }
    async checkBookExists(bookId) {
        const book = await this.prisma.book.findUnique({
            where: { book_id: bookId },
        });
        return !!book;
    }
    async checkUserExists(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        return !!user;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
