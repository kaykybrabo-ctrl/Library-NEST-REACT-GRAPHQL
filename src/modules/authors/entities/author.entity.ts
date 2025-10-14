import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field(() => Int)
  author_id: number;

  @Field()
  name_author: string;

  @Field({ nullable: true })
  biography?: string;

  @Field({ nullable: true })
  photo?: string;

  @Field(() => Date, { nullable: true })
  deleted_at?: Date;

  books?: any[];
}