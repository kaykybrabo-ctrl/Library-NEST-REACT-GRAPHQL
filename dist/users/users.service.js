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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        return this.prisma.user.create({
            data: createUserDto,
        });
    }
    async findAll() {
        return this.prisma.user.findMany();
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });
        if (!user)
            return null;
        // Return just the raw filename (or null) and let the frontend build the URL.
        // Avoid hardcoding hosts/ports which can break in different environments.
        const result = {
            ...user,
            profile_image: user.profile_image && user.profile_image.trim() !== ''
                ? user.profile_image
                : null,
        };
        return result;
    }
    async findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username }
        });
    }
    async findByIdRaw(id) {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }
    async update(id, updateUserDto) {
        const currentUser = await this.prisma.user.findUnique({ where: { id } });
        if (!currentUser) {
            throw new Error('User not found');
        }
        const updateData = {};
        if (updateUserDto.profile_image !== undefined) {
            updateData.profile_image = updateUserDto.profile_image || null;
        }
        if (updateUserDto.description !== undefined) {
            updateData.description = updateUserDto.description || null;
        }
        if (Object.keys(updateData).length === 0) {
            return currentUser;
        }
        const result = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        return this.findOne(id); // Use findOne to ensure consistent response format
    }
    async updateProfileImage(id, filename) {
        return this.update(id, { profile_image: filename });
    }
    async updateDescription(id, description) {
        return this.update(id, { description: description });
    }
    async remove(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
    async updateFavoriteBook(username, bookId) {
        await this.prisma.user.update({
            where: { username },
            data: { favorite_book_id: bookId },
        });
    }
    async getFavoriteBook(username) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: {
                favorite_book_id: true,
            },
        });
        if (!user?.favorite_book_id) {
            return null;
        }
        const book = await this.prisma.book.findUnique({
            where: { book_id: user.favorite_book_id },
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
            photo: book.photo,
            author_name: book.author.name_author,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
