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
    return { message: "Book rented successfully" };
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/rent/:id")
  async rentBookApi(@Param("id") bookId: string, @Request() req) {
    const loan = await this.loansService.create({
      user_id: req.user.id,
      book_id: +bookId,
    });
    return { message: "Book rented successfully" };
  }

  @Get("loans")
  async findLoans(@Query("username") username: string) {
    if (!username) {
      throw new Error("Username required");
    }
    return this.loansService.findByUser(username);
  }

  @Get("api/loans")
  async findLoansApi(@Query("username") username: string) {
    if (!username) {
      throw new Error("Username required");
    }
    return this.loansService.findByUser(username);
  }

  @Post("return/:loanId")
  async returnBook(@Param("loanId") loanId: string) {
    await this.loansService.remove(+loanId);
    return { message: "Book returned successfully" };
  }

  @Post("api/return/:loanId")
  async returnBookApi(@Param("loanId") loanId: string) {
    await this.loansService.remove(+loanId);
    return { message: "Book returned successfully" };
  }
}
