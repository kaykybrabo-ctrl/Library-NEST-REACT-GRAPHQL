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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        console.log('Validando usuário:', { username, password });
        // Define admin users
        const adminUsers = ['kayky@gmail.com', 'admin@example.com', 'admin'];
        const isAdmin = adminUsers.includes(username.toLowerCase());
        // Simplified auth - always return a valid user for demo
        const user = {
            id: 1,
            username: username,
            role: isAdmin ? 'admin' : 'user',
            full_name: username,
            user_id: 1
        };
        console.log('Autenticação bem-sucedida');
        return user;
    }
    async login(user) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            role: user.role,
            username: user.username,
            id: user.id,
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByUsername(registerDto.username);
        if (existingUser) {
            throw new common_1.ConflictException("Nome de usuário já existe");
        }
        const user = await this.usersService.create({
            username: registerDto.username.trim().toLowerCase(),
            password: registerDto.password,
            role: "user",
        });
        return { message: "Usuário criado com sucesso" };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
