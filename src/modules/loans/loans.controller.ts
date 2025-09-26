import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { LoansService } from "./loans.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @UseGuards(JwtAuthGuard)
  @Post("rent/:id")
  async rentBook(@Param("id") bookId: string, @Request() req) {
    const loan = await this.loansService.create({
      user_id: req.user.id,
      book_id: +bookId,
    });
    return { message: "Livro alugado com sucesso" };
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/rent/:id")
  async rentBookApi(@Param("id") bookId: string, @Request() req) {
    const loan = await this.loansService.create({
      user_id: req.user.id,
      book_id: +bookId,
    });
    return { message: "Livro alugado com sucesso" };
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
}
