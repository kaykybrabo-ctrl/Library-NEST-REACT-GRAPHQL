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
exports.LoansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let LoansService = class LoansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createLoanDto) {
        const existingLoan = await this.prisma.loan.findFirst({
            where: {
                user_id: createLoanDto.user_id,
                book_id: createLoanDto.book_id,
            },
        });
        if (existingLoan) {
            throw new common_1.ConflictException("Book already rented by you");
        }
        return this.prisma.loan.create({
            data: createLoanDto,
            include: {
                user: true,
                book: true,
            },
        });
    }
    async findByUser(username) {
        const loans = await this.prisma.loan.findMany({
            where: {
                user: {
                    username: username,
                },
            },
            include: {
                book: true,
                user: true,
            },
            orderBy: {
                loan_date: "desc",
            },
        });
        return loans.map((loan) => ({
            loans_id: loan.loans_id,
            loan_date: loan.loan_date,
            book_id: loan.book.book_id,
            title: loan.book.title,
            photo: loan.book.photo,
            description: loan.book.description,
        }));
    }
    async remove(loanId) {
        try {
            await this.prisma.loan.delete({
                where: { loans_id: loanId },
            });
        }
        catch (error) {
            throw new common_1.NotFoundException("Loan not found");
        }
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoansService);
