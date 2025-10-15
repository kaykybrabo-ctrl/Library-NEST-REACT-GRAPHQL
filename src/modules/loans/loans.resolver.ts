import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LoansService } from './loans.service';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { GqlAdminGuard } from '@/common/guards/gql-admin.guard';
import { Loan, LoanStatus, UserLoanStatus } from './entities/loan.entity';

@Resolver(() => Loan)
export class LoansResolver {
  constructor(private readonly loansService: LoansService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Loan)
  async rentBook(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Context() context
  ): Promise<Loan> {
    const user = context.req.user;
    const loan = await this.loansService.create({
      user_id: user.id,
      book_id: bookId,
    });

    return {
      loans_id: loan.loans_id,
      loan_date: loan.loan_date,
      due_date: loan.due_date,
      returned_at: loan.returned_at,
      is_overdue: loan.is_overdue,
      fine_amount: Number(loan.fine_amount),
      days_remaining: 0,
      hours_remaining: 0,
      time_remaining: '',
      book: loan.book,
      username: '',
      user_id: loan.user_id,
      book_id: loan.book_id,
      title: loan.book?.title || '',
      photo: loan.book?.photo,
      description: loan.book?.description,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async returnBook(@Args('loanId', { type: () => Int }) loanId: number): Promise<boolean> {
    await this.loansService.remove(loanId);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Loan])
  async myLoans(@Context() context): Promise<Loan[]> {
    const user = context.req.user;
    return this.loansService.findByUser(user.id);
  }

  @UseGuards(GqlAuthGuard, GqlAdminGuard)
  @Query(() => [Loan])
  async allLoans(): Promise<Loan[]> {
    return this.loansService.findAll();
  }

  @Query(() => LoanStatus)
  async bookLoanStatus(@Args('bookId', { type: () => Int }) bookId: number): Promise<LoanStatus> {
    const loan = await this.loansService.findByBookId(bookId);
    return {
      isRented: !!loan,
      loan: loan ? {
        loans_id: loan.loans_id,
        loan_date: loan.loan_date,
        due_date: loan.due_date,
        returned_at: loan.returned_at,
        is_overdue: loan.is_overdue,
        fine_amount: Number(loan.fine_amount),
        days_remaining: 0,
        hours_remaining: 0,
        time_remaining: '',
        username: loan.username || 'Usuário',
        user_id: loan.user_id,
        book_id: loan.book_id,
        title: loan.book?.title || '',
        photo: loan.book?.photo,
        description: loan.book?.description,
      } : null,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserLoanStatus)
  async myBookLoan(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Context() context
  ): Promise<UserLoanStatus> {
    const user = context.req.user;
    const loan = await this.loansService.findUserLoan(user.id, bookId);
    return {
      hasLoan: !!loan,
      loan: loan ? {
        loans_id: loan.loans_id,
        loan_date: loan.loan_date,
        due_date: loan.due_date,
        returned_at: loan.returned_at,
        is_overdue: loan.is_overdue,
        fine_amount: Number(loan.fine_amount),
        days_remaining: 0,
        hours_remaining: 0,
        time_remaining: '',
        username: '',
        user_id: loan.user_id,
        book_id: loan.book_id,
        title: loan.book?.title || '',
        photo: loan.book?.photo,
        description: loan.book?.description,
      } : null,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Loan])
  async overdueLoans(@Context() context): Promise<Loan[]> {
    const user = context.req.user;
    const overdueLoans = await this.loansService.getOverdueLoans(user.id);
    return overdueLoans.map(loan => ({
      loans_id: loan.loans_id,
      loan_date: new Date(),
      due_date: loan.due_date,
      returned_at: null,
      is_overdue: true,
      fine_amount: loan.fine_amount,
      days_remaining: 0,
      hours_remaining: 0,
      time_remaining: 'Vencido',
      username: '',
      user_id: 0,
      book_id: 0,
      title: loan.book_title,
      photo: null,
      description: null,
    }));
  }
}
