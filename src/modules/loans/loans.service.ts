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
    const authUser = await this.prisma.authUser.findUnique({
      where: { id: createLoanDto.user_id },
    });

    if (!authUser || !authUser.user_id) {
      throw new ConflictException('Usuário não encontrado ou não possui perfil completo');
    }

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
        user_id: authUser.user_id,
        book_id: createLoanDto.book_id,
        returned_at: null,
      },
    });

    if (userHasBook) {
      throw new ConflictException('Você já possui este livro emprestado');
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    const loan = await this.prisma.loan.create({
      data: {
        user_id: authUser.user_id,
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
      },
    });

      return loan;
  }

  async findByUser(userId: number): Promise<any[]> {
    try {
      const authUser = await this.prisma.authUser.findUnique({
        where: { id: userId },
      });

      if (!authUser || !authUser.user_id) {
        return [];
      }

      const loans = await this.prisma.loan.findMany({
        where: {
          user_id: authUser.user_id,
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
        const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));

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

  async findByUsername(username: string): Promise<any[]> {
    try {
      const authUser = await this.prisma.authUser.findUnique({
        where: { username: username },
      });

      if (!authUser || !authUser.user_id) {
        return [];
      }

      const loans = await this.prisma.loan.findMany({
        where: {
          user_id: authUser.user_id,
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
        const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));

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
          user: {
            include: {
              auth_user: true,
            },
          },
        },
        orderBy: {
          loan_date: 'desc',
        },
      });

      const now = new Date();
      const loansWithTimeRemaining = await Promise.all(loans.map(async loan => {
        const dueDate = new Date(loan.due_date);
        const isOverdue = now > dueDate;
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));

        const authUserResult = await this.prisma.$queryRaw`
          SELECT display_name, username 
          FROM auth_users 
          WHERE user_id = ${loan.user_id}
          LIMIT 1
        ` as any[];

        const authUser = authUserResult[0];
        const displayName = authUser?.display_name;
        const username = authUser?.username || loan.user?.email;
        const userDisplayName = displayName || username || 'Usuário';

        return {
          loans_id: loan.loans_id,
          loan_date: loan.loan_date,
          due_date: loan.due_date,
          book_id: loan.book_id,
          title: loan.book?.title || 'Título não encontrado',
          photo: loan.book?.photo || null,
          description: loan.book?.description || null,
          user_id: loan.user_id,
          username: userDisplayName,
          is_overdue: isOverdue,
          days_remaining: Math.max(0, daysRemaining),
          hours_remaining: Math.max(0, hoursRemaining),
          time_remaining: isOverdue ? 'Vencido' : this.formatTimeRemaining(daysRemaining, hoursRemaining),
        };
      }));

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
      const loan = await this.prisma.loan.findFirst({
        where: {
          book_id: bookId,
          returned_at: null,
        },
        include: {
          book: true,
        },
      });

      if (!loan) return null;

      const authUser = await this.prisma.authUser.findUnique({
        where: { user_id: loan.user_id },
      });

      let displayName = 'Usuário';
      if (authUser) {
        const userResult = await this.prisma.$queryRaw`
          SELECT display_name, username 
          FROM auth_users 
          WHERE id = ${authUser.id}
          LIMIT 1
        ` as any[];

        if (userResult.length > 0) {
          const userData = userResult[0];
          displayName = userData.display_name || 
                      (userData.username?.includes('@') ? userData.username.split('@')[0] : userData.username) || 
                      'Usuário';
        }
      }

      return {
        ...loan,
        username: displayName,
      };
    } catch (error) {
      return null;
    }
  }

  async findUserLoan(userId: number, bookId: number) {
    try {
      const authUser = await this.prisma.authUser.findUnique({
        where: { id: userId },
      });

      if (!authUser || !authUser.user_id) {
        return null;
      }

      return this.prisma.loan.findFirst({
        where: {
          user_id: authUser.user_id,
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
      const authUser = await this.prisma.authUser.findUnique({
        where: { id: userId },
      });

      if (!authUser || !authUser.user_id) {
        return [];
      }

      const now = new Date();
      const overdueLoans = await this.prisma.loan.findMany({
        where: {
          user_id: authUser.user_id,
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

  async findAuthUserById(userId: number) {
    try {
      return await this.prisma.authUser.findFirst({
        where: { user_id: userId },
        select: { username: true, photo: true }
      });
    } catch (error) {
      return null;
    }
  }

  async getAuthUserById(authUserId: number) {
    try {
      return await this.prisma.authUser.findUnique({
        where: { id: authUserId },
        select: { id: true, user_id: true, username: true, photo: true }
      });
    } catch (error) {
      return null;
    }
  }

  private formatTimeRemaining(days: number, hours: number): string {
    const totalHours = Math.floor(hours);
    let remainingHours = totalHours - (days * 24);
    let adjustedDays = days;
    
    if (remainingHours >= 24) {
      adjustedDays += Math.floor(remainingHours / 24);
      remainingHours = remainingHours % 24;
    }
    
    if (adjustedDays > 1) {
      return `${adjustedDays} dias e ${remainingHours}h`;
    } else if (adjustedDays === 1) {
      return `1 dia e ${remainingHours}h`;
    } else if (totalHours > 0) {
      return `${totalHours} hora${totalHours > 1 ? 's' : ''}`;
    } else {
      return 'Menos de 1 hora';
    }
  }
}
