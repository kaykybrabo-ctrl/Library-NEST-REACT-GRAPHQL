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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const path_1 = require("path");
let UsersController = class UsersController {
    static { UsersController_1 = this; }
    usersService;
    // Storage for user-specific data
    static userProfiles = new Map();
    constructor(usersService) {
        this.usersService = usersService;
    }
    // Helper method to get user profile data
    getUserProfile(username) {
        if (!UsersController_1.userProfiles.has(username)) {
            UsersController_1.userProfiles.set(username, {
                image: "default-user.png",
                description: "Usuário do sistema"
            });
        }
        return UsersController_1.userProfiles.get(username);
    }
    // Helper method to update user profile data
    updateUserProfile(username, updates) {
        const profile = this.getUserProfile(username);
        if (updates.image)
            profile.image = updates.image;
        if (updates.description)
            profile.description = updates.description;
        UsersController_1.userProfiles.set(username, profile);
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
        // await this.usersService.updateFavoriteBook(req.user.username, +bookId);
        return { message: "Book added to favorites" };
    }
    async addToFavoritesApi(bookId, req) {
        // await this.usersService.updateFavoriteBook(req.user.username, +bookId);
        return { message: "Book added to favorites" };
    }
    async updateProfile(req, updateUserDto, file) {
        if (file) {
            updateUserDto.profile_image = file.filename;
        }
        const result = await this.usersService.update(req.user.id, updateUserDto);
        const profile = await this.usersService.findOne(req.user.id);
        return profile;
    }
    async uploadImage(file, body, req, queryUsername) {
        // Get username from JWT token in Authorization header
        let username = "guest";
        try {
            const authHeader = req?.headers?.authorization;
            console.log('Upload - Auth header:', authHeader);
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const jwt = require('jsonwebtoken');
                const decoded = jwt.decode(token);
                console.log('Upload - Decoded JWT:', decoded);
                username = decoded?.username || decoded?.email || decoded?.sub || "guest";
                console.log('Upload - Extracted username:', username);
            }
        }
        catch (error) {
            console.log('Upload - Error decoding JWT:', error);
        }
        // Fallback to manual username if no JWT
        username = username !== "guest" ? username : (queryUsername || body?.username || body?.email || "guest");
        console.log('Upload - Final username:', username);
        if (file) {
            // Update user-specific profile image
            this.updateUserProfile(username, { image: file.filename });
            console.log(`Image uploaded for user ${username}: ${file.filename}, size: ${file.size} bytes`);
        }
        // Get current user profile
        const userProfile = this.getUserProfile(username);
        // Return profile with new filename and cache buster
        const response = {
            id: 1,
            username: username,
            email: `${username}@example.com`,
            role: "user",
            description: userProfile.description,
            profile_image: file ? file.filename : userProfile.image,
            timestamp: Date.now(),
            success: true
        };
        console.log('Upload response for user:', username, response);
        return response;
    }
    async saveDescription(body, req, queryUsername) {
        // Get username from JWT token in Authorization header
        let username = "guest";
        try {
            const authHeader = req?.headers?.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const jwt = require('jsonwebtoken');
                const decoded = jwt.decode(token);
                username = decoded?.username || decoded?.email || decoded?.sub || "guest";
            }
        }
        catch (error) {
            console.log('Error decoding JWT:', error);
        }
        // Fallback to manual username if no JWT
        username = username !== "guest" ? username : (queryUsername || body?.username || "guest");
        // Update user-specific description
        if (body.description) {
            this.updateUserProfile(username, { description: body.description });
        }
        // Get current user profile
        const userProfile = this.getUserProfile(username);
        return {
            id: 1,
            username: username,
            email: `${username}@example.com`,
            role: "user",
            description: userProfile.description,
            profile_image: userProfile.image
        };
    }
    async updateProfileApi(req, updateUserDto, file) {
        const updateData = {};
        if (file) {
            updateData.profile_image = file.filename;
        }
        if (updateUserDto.description !== undefined &&
            updateUserDto.description !== null &&
            updateUserDto.description.trim() !== "") {
            updateData.description = updateUserDto.description;
        }
        const result = await this.usersService.update(req.user.id, updateData);
        const profile = await this.usersService.findOne(req.user.id);
        return profile;
    }
    async getProfile(req) {
        // Get username from request or use default
        const username = req?.user?.username || req?.query?.username || "guest";
        const userProfile = this.getUserProfile(username);
        return {
            id: 1,
            username: username,
            email: `${username}@example.com`,
            role: "user",
            description: userProfile.description,
            profile_image: userProfile.image
        };
    }
    async getProfileApi(req) {
        // Get username from JWT token in Authorization header
        let username = "guest";
        try {
            const authHeader = req?.headers?.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const jwt = require('jsonwebtoken');
                const decoded = jwt.decode(token);
                username = decoded?.username || decoded?.email || decoded?.sub || "guest";
            }
        }
        catch (error) {
            console.log('Error decoding JWT:', error);
        }
        // Fallback to query parameter if no JWT
        username = username !== "guest" ? username : (req?.query?.username || "guest");
        const userProfile = this.getUserProfile(username);
        const profile = {
            id: 1,
            username: username,
            email: `${username}@example.com`,
            role: "user",
            description: userProfile.description,
            profile_image: userProfile.image,
            timestamp: Date.now(), // Add timestamp to break cache
            debug: {
                currentImage: userProfile.image,
                requestTime: new Date().toISOString(),
                username: username
            }
        };
        console.log('Profile requested for user:', username, 'at', new Date().toISOString(), '- Image:', userProfile.image);
        return profile;
    }
    async getCurrentImage(req) {
        const username = req?.user?.username || req?.query?.username || "guest";
        const userProfile = this.getUserProfile(username);
        return {
            username: username,
            currentProfileImage: userProfile.image,
            description: userProfile.description,
            timestamp: Date.now(),
            time: new Date().toISOString(),
            allUsers: Array.from(UsersController_1.userProfiles.keys())
        };
    }
    async debugUpdateProfile(req, updateUserDto, file) {
        if (file) {
            updateUserDto.profile_image = file.filename;
            const filePath = (0, path_1.join)(__dirname, "..", "..", "FRONTEND", "uploads", file.filename);
        }
        const result = await this.usersService
            .update(req.user?.id || 0, updateUserDto)
            .catch((e) => {
            return null;
        });
        const profile = await this.usersService.findOne(req.user?.id || 0);
        return { result, profile };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("users/favorite"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFavoriteBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("api/users/favorite"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFavoriteBookApi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("favorite/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addToFavorites", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("api/favorite/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addToFavoritesApi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("profile_image")),
    (0, common_1.Post)("update-profile"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("image", {
        storage: require('multer').diskStorage({
            destination: (req, file, cb) => {
                cb(null, require('path').join(process.cwd(), "FRONTEND", "uploads"));
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const extension = require('path').extname(file.originalname) || '.jpg';
                cb(null, uniqueSuffix + extension);
            }
        })
    })),
    (0, common_1.Post)("api/upload-image"),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)("api/save-description"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "saveDescription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("profile_image")),
    (0, common_1.Post)("api/update-profile"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfileApi", null);
__decorate([
    (0, common_1.Get)("get-profile"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)("api/get-profile"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfileApi", null);
__decorate([
    (0, common_1.Get)("api/debug/current-image"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentImage", null);
__decorate([
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("profile_image")),
    (0, common_1.Post)("api/debug/update-profile"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "debugUpdateProfile", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
