import { ObjectType, Field } from '@nestjs/graphql';
import { Book } from '../../books/entities/book.entity';

@ObjectType()
export class FavoriteResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class UserFavorite {
  @Field(() => Book, { nullable: true })
  favoriteBook?: Book;
}
