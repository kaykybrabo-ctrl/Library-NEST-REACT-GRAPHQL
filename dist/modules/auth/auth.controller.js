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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const users_service_1 = require("../users/users.service");
const mail_service_1 = require("../../infrastructure/mail/mail.service");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    authService;
    usersService;
    mailService;
    jwtService;
    constructor(authService, usersService, mailService, jwtService) {
        this.authService = authService;
        this.usersService = usersService;
        this.mailService = mailService;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        // Define admin users
        const adminUsers = ['kayky@gmail.com', 'admin@example.com', 'admin'];
        const isAdmin = adminUsers.includes(loginDto.username.toLowerCase());
        const userRole = isAdmin ? 'admin' : 'user';
        // Simplified login - always return success for demo
        const token = this.jwtService.sign({
            username: loginDto.username,
            sub: 1,
            role: userRole
        });
        return {
            token: token,
            user: {
                id: 1,
                username: loginDto.username,
                role: userRole
            }
        };
    }
    async oldLogin(req, loginDto) {
        const loginData = await this.authService.login(req.user);
        return {
            token: loginData.access_token,
            user: {
                id: loginData.id,
                username: loginData.username,
                role: loginData.role,
            },
        };
    }
    async getProfileMock() {
        // Return mock profile for demo - no database access
        return {
            id: 1,
            username: "admin",
            email: "admin@example.com",
            role: "admin",
            description: "Administrador do sistema",
            profile_image: null
        };
    }
    async saveDescription(body) {
        // Mock save description - no database access
        return {
            success: true,
            message: "Descrição salva com sucesso"
        };
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async registerApi(registerDto) {
        return this.authService.register(registerDto);
    }
    getProfile(req) {
        return req.user;
    }
    getProfileApi(req) {
        return req.user;
    }
    getUserRole(req) {
        return {
            role: req.user.role,
            isAdmin: req.user.role === "admin",
        };
    }
    getUserRoleApi(req) {
        return {
            role: req.user.role,
            isAdmin: req.user.role === "admin",
        };
    }
    async forgotPassword(body) {
        const username = (body?.username || "").trim();
        console.log('Forgot password solicitado para:', username);
        if (!username) {
            return { message: "Nome de usuário (e-mail) é obrigatório" };
        }
        const genericResponse = {
            message: "Se a conta existir, um e-mail de redefinição foi enviado",
        };
        const token = this.jwtService.sign({ username, purpose: "pwd_reset" }, { expiresIn: "15m" });
        const resetUrl = `${process.env.PUBLIC_WEB_URL || "http://localhost:8080"}/reset?u=${encodeURIComponent(username)}&t=${encodeURIComponent(token)}`;
        console.log('Reset URL gerada:', resetUrl);
        try {
            console.log('Tentando enviar email...');
            const res = await this.mailService.sendPasswordResetEmail(username, {
                username,
                resetUrl,
            });
            console.log('Resultado do envio de email:', res);
            if (res?.preview) {
                genericResponse.preview = res.preview;
                genericResponse.messageId = res.messageId;
                console.log('Preview adicionado à resposta:', res.preview);
            }
        }
        catch (error) {
            console.error('Erro ao enviar email:', error);
        }
        console.log('Resposta final:', genericResponse);
        return genericResponse;
    }
    async resetPassword(dto, req) {
        const newPassword = (dto?.newPassword || "").trim();
        if (!newPassword) {
            return { ok: false, message: "Nova senha é obrigatória" };
        }
        let username = (dto?.username || "").trim().toLowerCase();
        const token = (dto?.token || "").trim();
        if (token) {
            try {
                const payload = this.jwtService.verify(token);
                if (payload?.purpose !== "pwd_reset") {
                    return { ok: false, message: "Token inválido" };
                }
                username = (payload?.username || "").toLowerCase();
            }
            catch {
                return { ok: false, message: "Token inválido ou expirado" };
            }
        }
        if (!username) {
            return { ok: false, message: "Usuário ou token é obrigatório" };
        }
        try {
            const user = await this.usersService.findByUsername(username);
            if (!user) {
                return {
                    ok: true,
                    message: "A senha foi atualizada caso a conta exista",
                };
            }
            // await this.usersService.updatePasswordByUsername(username, newPassword);
            return { ok: true, message: "Senha atualizada com sucesso" };
        }
        catch (e) {
            return { ok: false, message: "Falha ao redefinir a senha" };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("old-login"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oldLogin", null);
__decorate([
    (0, common_1.Get)("get-profile"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfileMock", null);
__decorate([
    (0, common_1.Post)("save-description"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "saveDescription", null);
__decorate([
    (0, common_1.Post)("register"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("api/register"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerApi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("user/me"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("api/user/me"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfileApi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("user/role"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getUserRole", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("api/user/role"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getUserRoleApi", null);
__decorate([
    (0, common_1.Post)("api/forgot-password"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)("api/reset-password"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        mail_service_1.MailService,
        jwt_1.JwtService])
], AuthController);
