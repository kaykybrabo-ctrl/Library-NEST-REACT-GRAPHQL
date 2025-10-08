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
        console.log('Creating loan for:', createLoanDto);
        // Verificar se o livro já está emprestado
        const existingLoan = await this.prisma.loan.findFirst({
            where: {
                book_id: createLoanDto.book_id,
                returned_at: null, // Não foi devolvido ainda
            },
        });
        console.log('Existing loan check:', existingLoan);
        if (existingLoan) {
            console.log('Book already rented to user:', existingLoan.user_id);
            throw new common_1.ConflictException('Este livro já está emprestado para outro usuário');
        }
        // Verificar se o usuário já tem este livro emprestado
        const userHasBook = await this.prisma.loan.findFirst({
            where: {
                user_id: createLoanDto.user_id,
                book_id: createLoanDto.book_id,
                returned_at: null,
            },
        });
        console.log('User has book check:', userHasBook);
        if (userHasBook) {
            console.log('User already has this book rented');
            throw new common_1.ConflictException('Você já possui este livro emprestado');
        }
        const now = new Date();
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + 7); // 7 dias de empréstimo
        const loan = await this.prisma.loan.create({
            data: {
                user_id: createLoanDto.user_id,
                book_id: createLoanDto.book_id,
                loan_date: now,
                due_date: dueDate,
                returned_at: null,
                is_overdue: false,
                fine_amount: 0,
            },
            include: {
                book: {
                    include: {
                        author: true,
                    },
                },
                user: true,
            },
        });
        console.log('Loan created successfully:', loan);
        return loan;
    }
    async findByUser(userId) {
        try {
            const loans = await this.prisma.loan.findMany({
                where: {
                    user_id: userId,
                    returned_at: null, // Apenas empréstimos ativos
                },
                include: {
                    book: {
                        include: {
                            author: true,
                        },
                    },
                },
                orderBy: {
                    loan_date: 'desc',
                },
            });
            // Calcular tempo restante para cada empréstimo
            const now = new Date();
            const loansWithTimeRemaining = loans.map(loan => {
                const dueDate = new Date(loan.due_date);
                const isOverdue = now > dueDate;
                const timeDiff = dueDate.getTime() - now.getTime();
                const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                const hoursRemaining = Math.ceil(timeDiff / (1000 * 60 * 60));
                return {
                    loans_id: loan.loans_id,
                    loan_date: loan.loan_date,
                    due_date: loan.due_date,
                    book_id: loan.book_id,
                    title: loan.book?.title || 'Título não encontrado',
                    photo: loan.book?.photo || null,
                    description: loan.book?.description || null,
                    is_overdue: isOverdue,
                    fine_amount: loan.fine_amount,
                    days_remaining: Math.max(0, daysRemaining),
                    hours_remaining: Math.max(0, hoursRemaining),
                    time_remaining: isOverdue ? 'Vencido' : this.formatTimeRemaining(daysRemaining, hoursRemaining),
                };
            });
            console.log(`Found ${loansWithTimeRemaining.length} active loans for user ${userId}`);
            return loansWithTimeRemaining;
        }
        catch (error) {
            console.error('Error finding loans by user:', error);
            return [];
        }
    }
    async findAll() {
        try {
            const loans = await this.prisma.loan.findMany({
                where: {
                    returned_at: null, // Apenas empréstimos ativos
                },
                include: {
                    book: {
                        include: {
                            author: true,
                        },
                    },
                    user: true,
                },
                orderBy: {
                    loan_date: 'desc',
                },
            });
            // Calcular tempo restante para cada empréstimo
            const now = new Date();
            const loansWithTimeRemaining = loans.map(loan => {
                const dueDate = new Date(loan.due_date);
                const isOverdue = now > dueDate;
                const timeDiff = dueDate.getTime() - now.getTime();
                const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                const hoursRemaining = Math.ceil(timeDiff / (1000 * 60 * 60));
                return {
                    loans_id: loan.loans_id,
                    loan_date: loan.loan_date,
                    due_date: loan.due_date,
                    book_id: loan.book_id,
                    title: loan.book?.title || 'Título não encontrado',
                    photo: loan.book?.photo || null,
                    description: loan.book?.description || null,
                    user_id: loan.user_id,
                    username: loan.user?.email || 'Usuário não encontrado',
                    is_overdue: isOverdue,
                    days_remaining: Math.max(0, daysRemaining),
                    hours_remaining: Math.max(0, hoursRemaining),
                    time_remaining: isOverdue ? 'Vencido' : this.formatTimeRemaining(daysRemaining, hoursRemaining),
                };
            });
            console.log(`Found ${loansWithTimeRemaining.length} total active loans`);
            return loansWithTimeRemaining;
        }
        catch (error) {
            console.error('Error finding all loans:', error);
            return [];
        }
    }
    async findById(loanId) {
        try {
            return this.prisma.loan.findUnique({
                where: {
                    loans_id: loanId,
                },
                include: {
                    book: {
                        include: {
                            author: true,
                        },
                    },
                    user: true,
                },
            });
        }
        catch (error) {
            console.log('Error in findById:', error);
            return null;
        }
    }
    async findAllLoansForBook(bookId) {
        try {
            return this.prisma.loan.findMany({
                where: {
                    book_id: bookId,
                },
                include: {
                    book: true,
                    user: true,
                },
                orderBy: {
                    loan_date: 'desc',
                },
            });
        }
        catch (error) {
            console.log('Error in findAllLoansForBook:', error);
            return [];
        }
    }
    async findByBookId(bookId) {
        try {
            return this.prisma.loan.findFirst({
                where: {
                    book_id: bookId,
                    returned_at: null, // Apenas empréstimos ativos
                },
                include: {
                    book: true,
                    user: true,
                },
            });
        }
        catch (error) {
            console.log('Error in findByBookId:', error);
            return null;
        }
    }
    async findUserLoan(userId, bookId) {
        try {
            return this.prisma.loan.findFirst({
                where: {
                    user_id: userId,
                    book_id: bookId,
                    returned_at: null, // Apenas empréstimos ativos
                },
                include: {
                    book: true,
                },
            });
        }
        catch (error) {
            console.log('Error in findUserLoan:', error);
            return null;
        }
    }
    async remove(loanId) {
        try {
            // Marcar empréstimo como devolvido
            await this.prisma.loan.update({
                where: {
                    loans_id: loanId,
                },
                data: {
                    returned_at: new Date(),
                },
            });
            console.log(`Loan ${loanId} marked as returned`);
        }
        catch (error) {
            console.error('Error returning loan:', error);
            throw new common_1.NotFoundException('Empréstimo não encontrado');
        }
    }
    async getOverdueLoans(userId) {
        try {
            const now = new Date();
            const overdueLoans = await this.prisma.loan.findMany({
                where: {
                    user_id: userId,
                    returned_at: null,
                    due_date: {
                        lt: now, // Data de vencimento menor que agora
                    },
                },
                include: {
                    book: true,
                },
            });
            const formattedOverdueLoans = overdueLoans.map(loan => ({
                loans_id: loan.loans_id,
                book_title: loan.book?.title || 'Título não encontrado',
                fine_amount: loan.fine_amount,
                due_date: loan.due_date,
            }));
            console.log(`Found ${formattedOverdueLoans.length} overdue loans for user ${userId}`);
            return formattedOverdueLoans;
        }
        catch (error) {
            console.error('Error finding overdue loans:', error);
            return [];
        }
    }
    formatTimeRemaining(days, hours) {
        if (days > 0) {
            return `${days} dia${days > 1 ? 's' : ''}`;
        }
        else if (hours > 0) {
            return `${hours} hora${hours > 1 ? 's' : ''}`;
        }
        else {
            return 'Menos de 1 hora';
        }
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoansService);
