import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(createLoanDto: any): Promise<any> {
    const existingLoan = await this.prisma.loan.findFirst({
      where: {
        book_id: createLoanDto.book_id,
        returned_at: null,
      },
    });

    if (existingLoan) {
      throw new ConflictException('Este livro já está emprestado para outro usuário');
    }

    const userHasBook = await this.prisma.loan.findFirst({
      where: {
        user_id: createLoanDto.user_id,
        book_id: createLoanDto.book_id,
        returned_at: null,
      },
    });

    if (userHasBook) {
      throw new ConflictException('Você já possui este livro emprestado');
    }

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7);
    
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

      return loan;
  }

  async findByUser(userId: number): Promise<any[]> {
    try {
      const loans = await this.prisma.loan.findMany({
        where: {
          user_id: userId,
          returned_at: null,
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

      return loansWithTimeRemaining;
    } catch (error) {
      return [];
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const loans = await this.prisma.loan.findMany({
        where: {
          returned_at: null,
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
          username: loan.user?.email || 'Email não encontrado',
          is_overdue: isOverdue,
          days_remaining: Math.max(0, daysRemaining),
          hours_remaining: Math.max(0, hoursRemaining),
          time_remaining: isOverdue ? 'Vencido' : this.formatTimeRemaining(daysRemaining, hoursRemaining),
        };
      });

      return loansWithTimeRemaining;
    } catch (error) {
      return [];
    }
  }

  async findById(loanId: number) {
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
    } catch (error) {
      return null;
    }
  }

  async findAllLoansForBook(bookId: number) {
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
    } catch (error) {
      return [];
    }
  }

  async findByBookId(bookId: number) {
    try {
      return this.prisma.loan.findFirst({
        where: {
          book_id: bookId,
          returned_at: null,
        },
        include: {
          book: true,
          user: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async findUserLoan(userId: number, bookId: number) {
    try {
      return this.prisma.loan.findFirst({
        where: {
          user_id: userId,
          book_id: bookId,
          returned_at: null,
        },
        include: {
          book: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async remove(loanId: number): Promise<void> {
    try {
      await this.prisma.loan.update({
        where: {
          loans_id: loanId,
        },
        data: {
          returned_at: new Date(),
        },
      });
    } catch (error) {
      throw new NotFoundException('Empréstimo não encontrado');
    }
  }

  async getOverdueLoans(userId: number): Promise<any[]> {
    try {
      const now = new Date();
      const overdueLoans = await this.prisma.loan.findMany({
        where: {
          user_id: userId,
          returned_at: null,
          due_date: {
            lt: now,
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

      return formattedOverdueLoans;
    } catch (error) {
      return [];
    }
  }

  private formatTimeRemaining(days: number, hours: number): string {
    if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return 'Menos de 1 hora';
    }
  }
}
