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
  ConflictException,
} from "@nestjs/common";
import { LoansService } from "./loans.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";

@Controller('api')
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
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException({
        message: 'Erro interno do servidor',
        error: error.message,
        details: error
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("loans")
  async findLoans(@Request() req, @Query("username") username?: string) {
    return this.loansService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("return/:loanId")
  async returnBook(@Param("loanId") loanId: string, @Request() req) {
    const loan = await this.loansService.findById(+loanId);
    if (!loan) {
      throw new HttpException('Empréstimo não encontrado', HttpStatus.NOT_FOUND);
    }
    
    // Busca o AuthUser para pegar o user_id correto
    const authUser = await this.loansService.getAuthUserById(req.user.id);
    
    if (!authUser || !authUser.user_id) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    
    if (loan.user_id !== authUser.user_id && req.user.role !== 'admin') {
      throw new HttpException('Você não tem permissão para devolver este livro', HttpStatus.FORBIDDEN);
    }
    
    await this.loansService.remove(+loanId);
    
    return { 
      success: true,
      message: "Livro devolvido com sucesso",
      loanId: +loanId,
      bookTitle: loan.book?.title || 'Livro'
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get("loans/all")
  async findAllLoans() {
    return this.loansService.findAll();
  }

  @Get("test-loans")
  async testLoans() {
    return { message: "Loans API working", loans: [] };
  }

  @Get("debug/book/:id/loans")
  async debugBookLoans(@Param("id") bookId: string) {
    const allLoans = await this.loansService.findAllLoansForBook(+bookId);
    const activeLoans = await this.loansService.findByBookId(+bookId);
    return {
      bookId: +bookId,
      allLoans,
      activeLoans,
      hasActiveLoans: !!activeLoans
    };
  }

  @Get("books/:id/loan-status")
  async getBookLoanStatus(@Param("id") bookId: string) {
    try {
      const loan = await this.loansService.findByBookId(+bookId);
      if (loan && loan.user_id) {
        const authUser = await this.loansService.findAuthUserById(loan.user_id);
        const displayName = authUser?.photo || authUser?.username || 'Usuário desconhecido';
        return {
          isRented: !!loan,
          loan: {
            ...loan,
            user: {
              username: displayName
            }
          },
        };
      }
      return {
        isRented: !!loan,
        loan: loan,
      };
    } catch (error) {
      return {
        isRented: false,
        loan: null,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("books/:id/my-loan")
  async getMyLoanForBook(@Param("id") bookId: string, @Request() req) {
    try {
      const loan = await this.loansService.findUserLoan(req.user.id, +bookId);
      return {
        hasLoan: !!loan,
        loan: loan,
      };
    } catch (error) {
      return {
        hasLoan: false,
        loan: null,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("books/:id/return")
  async returnBookByBookId(@Param("id") bookId: string, @Request() req) {
    // findUserLoan já faz a conversão de AuthUser.id para User.user_id internamente
    const loan = await this.loansService.findUserLoan(req.user.id, +bookId);
    if (!loan) {
      throw new HttpException('Você não possui este livro alugado', HttpStatus.NOT_FOUND);
    }
    await this.loansService.remove(loan.loans_id);
    return { message: "Livro devolvido com sucesso" };
  }

  @UseGuards(JwtAuthGuard)
  @Get("loans/overdue")
  async getOverdueLoans(@Request() req) {
    try {
      if (req.user.role === 'admin') {
        return [];
      }
      return this.loansService.getOverdueLoans(req.user.id);
    } catch (error) {
      return [];
    }
  }
}
