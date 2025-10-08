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
const admin_guard_1 = require("../auth/admin.guard");
let LoansController = class LoansController {
    loansService;
    constructor(loansService) {
        this.loansService = loansService;
    }
    async rentBook(bookId, req) {
        try {
            console.log('Rent request - User:', req.user.id, 'Book:', bookId);
            const loan = await this.loansService.create({
                user_id: req.user.id,
                book_id: +bookId,
            });
            return { message: "Livro alugado com sucesso", loan };
        }
        catch (error) {
            console.error('Rent error:', error.message);
            if (error instanceof common_1.ConflictException) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException('Erro interno do servidor', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findLoans(req, username) {
        // Retornar empréstimos do usuário logado
        return this.loansService.findByUser(req.user.id);
    }
    async returnBook(loanId, req) {
        // Verificar se o empréstimo pertence ao usuário logado
        const loan = await this.loansService.findById(+loanId);
        if (!loan) {
            throw new common_1.HttpException('Empréstimo não encontrado', common_1.HttpStatus.NOT_FOUND);
        }
        if (loan.user_id !== req.user.id && req.user.role !== 'admin') {
            throw new common_1.HttpException('Você não tem permissão para devolver este livro', common_1.HttpStatus.FORBIDDEN);
        }
        await this.loansService.remove(+loanId);
        return {
            success: true,
            message: "Livro devolvido com sucesso",
            loanId: +loanId,
            bookTitle: loan.book?.title || 'Livro'
        };
    }
    // Endpoint para admin listar todos os empréstimos
    async findAllLoans() {
        return this.loansService.findAll();
    }
    async testLoans() {
        return { message: "Loans API working", loans: [] };
    }
    // Endpoint temporário para diagnóstico
    async debugBookLoans(bookId) {
        const allLoans = await this.loansService.findAllLoansForBook(+bookId);
        const activeLoans = await this.loansService.findByBookId(+bookId);
        return {
            bookId: +bookId,
            allLoans,
            activeLoans,
            hasActiveLoans: !!activeLoans
        };
    }
    // Endpoint para verificar status de um livro
    async getBookLoanStatus(bookId) {
        try {
            const loan = await this.loansService.findByBookId(+bookId);
            return {
                isRented: !!loan,
                loan: loan,
            };
        }
        catch (error) {
            return {
                isRented: false,
                loan: null,
            };
        }
    }
    // Endpoint para usuário verificar seus empréstimos de um livro específico
    async getMyLoanForBook(bookId, req) {
        try {
            const loan = await this.loansService.findUserLoan(req.user.id, +bookId);
            return {
                hasLoan: !!loan,
                loan: loan,
            };
        }
        catch (error) {
            return {
                hasLoan: false,
                loan: null,
            };
        }
    }
    // Endpoint para devolver livro pelo book_id (mais conveniente para o frontend)
    async returnBookByBookId(bookId, req) {
        const loan = await this.loansService.findUserLoan(req.user.id, +bookId);
        if (!loan) {
            throw new common_1.HttpException('Você não possui este livro alugado', common_1.HttpStatus.NOT_FOUND);
        }
        await this.loansService.remove(loan.loans_id);
        return { message: "Livro devolvido com sucesso" };
    }
    // Endpoint para verificar empréstimos em atraso do usuário
    async getOverdueLoans(req) {
        try {
            // Admin não tem multas
            if (req.user.role === 'admin') {
                return [];
            }
            return this.loansService.getOverdueLoans(req.user.id);
        }
        catch (error) {
            return [];
        }
    }
};
exports.LoansController = LoansController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("rent/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "rentBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("loans"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findLoans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("return/:loanId"),
    __param(0, (0, common_1.Param)("loanId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "returnBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Get)("loans/all"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findAllLoans", null);
__decorate([
    (0, common_1.Get)("test-loans"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "testLoans", null);
__decorate([
    (0, common_1.Get)("debug/book/:id/loans"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "debugBookLoans", null);
__decorate([
    (0, common_1.Get)("books/:id/loan-status"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "getBookLoanStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("books/:id/my-loan"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "getMyLoanForBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("books/:id/return"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "returnBookByBookId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("loans/overdue"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "getOverdueLoans", null);
exports.LoansController = LoansController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [loans_service_1.LoansService])
], LoansController);
