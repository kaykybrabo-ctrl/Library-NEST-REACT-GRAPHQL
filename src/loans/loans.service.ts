import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLoanDto } from "./dto/create-loan.dto";

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(createLoanDto: CreateLoanDto) {
    const existingLoan = await this.prisma.loan.findFirst({
      where: {
        user_id: createLoanDto.user_id,
        book_id: createLoanDto.book_id,
      },
    });

    if (existingLoan) {
      throw new ConflictException("Book already rented by you");
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
