import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Book } from '../../books/entities/book.entity';

@ObjectType()
export class ReviewUser {
  @Field()
  username: string;

  @Field({ nullable: true })
  photo?: string;
}

@ObjectType()
export class Review {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  book_id: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Book, { nullable: true })
  book?: Book;

  @Field(() => ReviewUser, { nullable: true })
  user?: ReviewUser;
}

@ObjectType()
export class BookRating {
  @Field(() => Number)
  averageRating: number;

  @Field(() => Int)
  totalReviews: number;
}
