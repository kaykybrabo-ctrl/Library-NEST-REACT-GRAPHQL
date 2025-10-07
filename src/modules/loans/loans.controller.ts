import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { LoansService } from "./loans.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @UseGuards(JwtAuthGuard)
  @Post("rent/:id")
  async rentBook(@Param("id") bookId: string, @Request() req) {
    try {
      const loan = await this.loansService.create({
        user_id: req.user.id,
        book_id: +bookId,
      });
      return { message: "Livro alugado com sucesso", loan };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/rent/:id")
  async rentBookApi(@Param("id") bookId: string, @Request() req) {
    try {
      const loan = await this.loansService.create({
        user_id: req.user.id,
        book_id: +bookId,
      });
      return { message: "Livro alugado com sucesso", loan };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  @Get("loans")
  async findLoans(@Query("username") username: string) {
    if (!username) {
      throw new Error("Nome de usuário obrigatório");
    }
    return this.loansService.findByUser(username);
  }

  @Get("api/loans")
  async findLoansApi(@Query("username") username: string) {
    if (!username) {
      throw new Error("Nome de usuário obrigatório");
    }
    return this.loansService.findByUser(username);
  }

  @Post("return/:loanId")
  async returnBook(@Param("loanId") loanId: string) {
    await this.loansService.remove(+loanId);
    return { message: "Livro devolvido com sucesso" };
  }

  @Post("api/return/:loanId")
  async returnBookApi(@Param("loanId") loanId: string) {
    await this.loansService.remove(+loanId);
    return { message: "Livro devolvido com sucesso" };
  }

  // Endpoint para admin listar todos os empréstimos
  @UseGuards(JwtAuthGuard)
  @Get("api/loans/all")
  async findAllLoans(@Request() req) {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      throw new HttpException('Acesso negado', HttpStatus.FORBIDDEN);
    }
    return this.loansService.findAll();
  }

  // Endpoint para verificar status de um livro
  @Get("api/books/:id/loan-status")
  async getBookLoanStatus(@Param("id") bookId: string) {
    const loan = await this.loansService.findByBookId(+bookId);
    return {
      isRented: !!loan,
      loan: loan ? {
        loans_id: loan.loans_id,
        loan_date: loan.loan_date,
        username: loan.user.username,
        user_id: loan.user.id,
      } : null,
    };
  }

  // Endpoint para usuário verificar seus empréstimos de um livro específico
  @UseGuards(JwtAuthGuard)
  @Get("api/books/:id/my-loan")
  async getMyLoanForBook(@Param("id") bookId: string, @Request() req) {
    const loan = await this.loansService.findUserLoan(req.user.id, +bookId);
    return {
      hasLoan: !!loan,
      loan: loan ? {
        loans_id: loan.loans_id,
        loan_date: loan.loan_date,
      } : null,
    };
  }

  // Endpoint para devolver livro pelo book_id (mais conveniente para o frontend)
  @UseGuards(JwtAuthGuard)
  @Post("api/books/:id/return")
  async returnBookByBookId(@Param("id") bookId: string, @Request() req) {
    const loan = await this.loansService.findUserLoan(req.user.id, +bookId);
    if (!loan) {
      throw new HttpException('Você não possui este livro alugado', HttpStatus.NOT_FOUND);
    }
    await this.loansService.remove(loan.loans_id);
    return { message: "Livro devolvido com sucesso" };
  }
}
