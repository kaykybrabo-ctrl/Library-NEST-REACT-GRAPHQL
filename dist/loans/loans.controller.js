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
exports.LoansController = void 0;
const common_1 = require("@nestjs/common");
const loans_service_1 = require("./loans.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let LoansController = class LoansController {
    loansService;
    constructor(loansService) {
        this.loansService = loansService;
    }
    async rentBook(bookId, req) {
        const loan = await this.loansService.create({
            user_id: req.user.id,
            book_id: +bookId,
        });
        return { message: 'Book rented successfully' };
    }
    async rentBookApi(bookId, req) {
        const loan = await this.loansService.create({
            user_id: req.user.id,
            book_id: +bookId,
        });
        return { message: 'Book rented successfully' };
    }
    async findLoans(username) {
        if (!username) {
            throw new Error('Username required');
        }
        return this.loansService.findByUser(username);
    }
    async findLoansApi(username) {
        if (!username) {
            throw new Error('Username required');
        }
        return this.loansService.findByUser(username);
    }
    async returnBook(loanId) {
        await this.loansService.remove(+loanId);
        return { message: 'Book returned successfully' };
    }
    async returnBookApi(loanId) {
        await this.loansService.remove(+loanId);
        return { message: 'Book returned successfully' };
    }
};
exports.LoansController = LoansController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('rent/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "rentBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('api/rent/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "rentBookApi", null);
__decorate([
    (0, common_1.Get)('loans'),
    __param(0, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findLoans", null);
__decorate([
    (0, common_1.Get)('api/loans'),
    __param(0, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findLoansApi", null);
__decorate([
    (0, common_1.Post)('return/:loanId'),
    __param(0, (0, common_1.Param)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "returnBook", null);
__decorate([
    (0, common_1.Post)('api/return/:loanId'),
    __param(0, (0, common_1.Param)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "returnBookApi", null);
exports.LoansController = LoansController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [loans_service_1.LoansService])
], LoansController);
