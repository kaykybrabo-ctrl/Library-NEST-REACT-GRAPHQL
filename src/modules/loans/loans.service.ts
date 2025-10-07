import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { CreateLoanDto } from "./dto/create-loan.dto";

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(createLoanDto: CreateLoanDto) {
    // Verifica se o livro já está alugado por qualquer pessoa
    const existingLoan = await this.prisma.loan.findFirst({
      where: {
        book_id: createLoanDto.book_id,
      },
      include: {
        user: true,
        book: true,
      },
    });

    if (existingLoan) {
      if (existingLoan.user_id === createLoanDto.user_id) {
        throw new ConflictException("Você já alugou este livro");
      } else {
        throw new ConflictException(`Este livro já está alugado por ${existingLoan.user.username}`);
      }
    }

    return this.prisma.loan.create({
      data: createLoanDto,
      include: {
        user: true,
        book: true,
      },
    });
  }

  async findByUser(username: string): Promise<any[]> {
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

  async findAll(): Promise<any[]> {
    const loans = await this.prisma.loan.findMany({
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
      user_id: loan.user.id,
      username: loan.user.username,
    }));
  }

  async findByBookId(bookId: number) {
    return this.prisma.loan.findFirst({
      where: {
        book_id: bookId,
      },
      include: {
        user: true,
        book: true,
      },
    });
  }

  async findUserLoan(userId: number, bookId: number) {
    return this.prisma.loan.findFirst({
      where: {
        user_id: userId,
        book_id: bookId,
      },
    });
  }

  async remove(loanId: number): Promise<void> {
    try {
      await this.prisma.loan.delete({
        where: { loans_id: loanId },
      });
    } catch (error) {
      throw new NotFoundException("Loan not found");
    }
  }
}
