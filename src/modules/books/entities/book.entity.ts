import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Review } from '../../reviews/entities/review.entity';

@ObjectType()
export class Book {
  @Field(() => Int)
  book_id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  photo?: string;

  @Field(() => Date, { nullable: true })
  deleted_at?: Date;

  author?: any;

  @Field(() => Int, { nullable: true })
  author_id?: number;

  @Field(() => [Review], { nullable: true }) 
  reviews?: Review[];
}