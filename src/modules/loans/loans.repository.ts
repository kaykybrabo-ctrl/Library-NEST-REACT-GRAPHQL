import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Loan, Prisma } from '@prisma/client';
import { DatabaseOperationException } from '@/common/exceptions/custom.exception';

@Injectable()
export class LoansRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LoanCreateInput): Promise<Loan> {
    try {
      return await this.prisma.loan.create({
        data,
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('criar empréstimo', error.message);
    }
  }

  async findAll(): Promise<Loan[]> {
    try {
      return await this.prisma.loan.findMany({
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
    } catch (error) {
      throw new DatabaseOperationException('buscar empréstimos', error.message);
    }
  }

  async findByUserId(userId: number): Promise<Loan[]> {
    try {
      return await this.prisma.loan.findMany({
        where: { user_id: userId },
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
    } catch (error) {
      throw new DatabaseOperationException('buscar empréstimos do usuário', error.message);
    }
  }

  async findById(id: number): Promise<Loan | null> {
    try {
      return await this.prisma.loan.findUnique({
        where: { loans_id: id },
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar empréstimo por ID', error.message);
    }
  }

  async findUserLoan(userId: number, bookId: number): Promise<Loan | null> {
    try {
      return await this.prisma.loan.findFirst({
        where: {
          user_id: userId,
          book_id: bookId,
          returned_at: null,
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
      throw new DatabaseOperationException('buscar empréstimo do usuário', error.message);
    }
  }

  async findActiveByBookId(bookId: number): Promise<Loan | null> {
    try {
      return await this.prisma.loan.findFirst({
        where: {
          book_id: bookId,
          returned_at: null,
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
      throw new DatabaseOperationException('buscar empréstimo ativo do livro', error.message);
    }
  }

  async update(id: number, data: Prisma.LoanUpdateInput): Promise<Loan> {
    try {
      return await this.prisma.loan.update({
        where: { loans_id: id },
        data,
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar empréstimo', error.message);
    }
  }

  async delete(id: number): Promise<Loan> {
    try {
      return await this.prisma.loan.delete({
        where: { loans_id: id },
      });
    } catch (error) {
      throw new DatabaseOperationException('excluir empréstimo', error.message);
    }
  }

  async findOverdueLoans(): Promise<Loan[]> {
    try {
      return await this.prisma.loan.findMany({
        where: {
          returned_at: null,
          due_date: {
            lt: new Date(),
          },
        },
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
        orderBy: {
          due_date: 'asc',
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar empréstimos em atraso', error.message);
    }
  }
}
