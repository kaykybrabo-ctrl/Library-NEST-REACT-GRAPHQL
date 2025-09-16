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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const fs_1 = require("fs");
const path_1 = require("path");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getFavoriteBook(req) {
        const username = req.query.username || req.user.username;
        return this.usersService.getFavoriteBook(username);
    }
    async getFavoriteBookApi(req) {
        const username = req.query.username || req.user.username;
        return this.usersService.getFavoriteBook(username);
    }
    async addToFavorites(bookId, req) {
        await this.usersService.updateFavoriteBook(req.user.username, +bookId);
        return { message: 'Book added to favorites' };
    }
    async addToFavoritesApi(bookId, req) {
        await this.usersService.updateFavoriteBook(req.user.username, +bookId);
        return { message: 'Book added to favorites' };
    }
    async updateProfile(req, updateUserDto, file) {
        console.log('Update profile request:', { updateUserDto, file: file?.filename, user: req.user });
        if (file) {
            updateUserDto.profile_image = file.filename;
        }
        const result = await this.usersService.update(req.user.id, updateUserDto);
        console.log('Update profile result:', result);
        const profile = await this.usersService.findOne(req.user.id);
        return profile;
    }
    async uploadImage(req, file, body) {
        if (!file) {
            throw new Error('No file provided');
        }
        const currentUser = await this.usersService.findByIdRaw(req.user.id);
        await this.usersService.updateProfileImage(req.user.id, file.filename);
        return await this.usersService.findOne(req.user.id);
    }
    async saveDescription(req, body) {
        await this.usersService.updateDescription(req.user.id, body.description);
        return await this.usersService.findOne(req.user.id);
    }
    async updateProfileApi(req, updateUserDto, file) {
        console.log('=== UPDATE PROFILE DEBUG ===');
        console.log('Raw body:', req.body);
        console.log('UpdateUserDto:', updateUserDto);
        console.log('File:', file ? { filename: file.filename, originalname: file.originalname } : null);
        console.log('User:', req.user);
        const updateData = {};
        if (file) {
            updateData.profile_image = file.filename;
            console.log('Adding profile_image to update:', file.filename);
        }
        if (updateUserDto.description !== undefined && updateUserDto.description !== null && updateUserDto.description.trim() !== '') {
            updateData.description = updateUserDto.description;
            console.log('Adding description to update:', updateUserDto.description);
        }
        console.log('Final update data:', updateData);
        const result = await this.usersService.update(req.user.id, updateData);
        console.log('Update result:', result);
        const profile = await this.usersService.findOne(req.user.id);
        console.log('Final profile:', profile);
        console.log('=== END DEBUG ===');
        return profile;
    }
    async getProfile(req) {
        return this.usersService.findOne(req.user.id);
    }
    async getProfileApi(req) {
        const profile = await this.usersService.findOne(req.user.id);
        console.log('Profile API response:', profile);
        console.log('Profile image field:', profile?.profile_image);
        return profile;
    }
    async debugUpdateProfile(req, updateUserDto, file) {
        console.log('Debug upload request:', { updateUserDto, file: file ? file.filename : null });
        if (file) {
            updateUserDto.profile_image = file.filename;
            const filePath = (0, path_1.join)(__dirname, '..', '..', 'FRONTEND', 'uploads', file.filename);
            console.log('Expected file path:', filePath, 'exists:', (0, fs_1.existsSync)(filePath));
        }
        const result = await this.usersService.update(req.user?.id || 0, updateUserDto).catch(e => {
            console.error('Debug update error:', e);
            return null;
        });
        const profile = await this.usersService.findOne(req.user?.id || 0);
        return { result, profile };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('users/favorite'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFavoriteBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('api/users/favorite'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFavoriteBookApi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('favorite/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addToFavorites", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('api/favorite/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addToFavoritesApi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profile_image')),
    (0, common_1.Post)('update-profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    (0, common_1.Post)('api/upload-image'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('api/save-description'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "saveDescription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profile_image')),
    (0, common_1.Post)('api/update-profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfileApi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('get-profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('api/get-profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfileApi", null);
__decorate([
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profile_image')),
    (0, common_1.Post)('api/debug/update-profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "debugUpdateProfile", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
