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
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createUserDto) {
        return this.prisma.user.create({
            data: {
                full_name: createUserDto.username || 'User',
                email: 'user@example.com',
                address: 'Address',
                birth_date: new Date(),
            },
        });
    }
    async findAll() {
        return this.prisma.user.findMany();
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: id },
        });
        if (!user)
            return null;
        return {
            id: user.user_id,
            username: user.full_name,
            email: user.email,
            role: 'user',
            profile_image: null,
        };
    }
    async findByUsername(username) {
        // Simplified - return a mock user for now
        return {
            user_id: 1,
            full_name: username,
            email: 'user@test.com',
            address: 'Test Address',
            birth_date: new Date(),
            id: 1,
            username: username,
            role: 'admin',
            password: 'admin'
        };
    }
    async findByIdRaw(id) {
        return this.prisma.user.findUnique({
            where: { user_id: id },
        });
    }
    async update(id, updateUserDto) {
        return this.prisma.user.update({
            where: { user_id: id },
            data: {
                full_name: updateUserDto.username,
            },
        });
    }
    async remove(id) {
        await this.prisma.user.delete({
            where: { user_id: id },
        });
    }
    async getFavoriteBook(username) {
        return null; // Simplified - no favorite book functionality
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
