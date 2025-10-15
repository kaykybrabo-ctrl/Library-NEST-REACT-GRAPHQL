import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Book } from '../../books/entities/book.entity';

@ObjectType()
export class Loan {
  @Field(() => ID)
  loans_id: number;

  @Field()
  loan_date: Date;

  @Field({ nullable: true })
  due_date?: Date;

  @Field({ nullable: true })
  returned_at?: Date;

  @Field()
  is_overdue: boolean;

  @Field(() => Float)
  fine_amount: number;

  @Field(() => Int)
  days_remaining: number;

  @Field(() => Int)
  hours_remaining: number;

  @Field()
  time_remaining: string;

  @Field(() => Book, { nullable: true })
  book?: Book;

  @Field()
  username: string;

  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  book_id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  photo?: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class LoanStatus {
  @Field()
  isRented: boolean;

  @Field(() => Loan, { nullable: true })
  loan?: Loan;
}

@ObjectType()
export class UserLoanStatus {
  @Field()
  hasLoan: boolean;

  @Field(() => Loan, { nullable: true })
  loan?: Loan;
}
