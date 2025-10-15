import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  profile_image?: string;

  @Field({ nullable: true })
  display_name?: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  token: string;

  @Field(() => AuthUser)
  user: AuthUser;
}

@ObjectType()
export class UserProfile {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  profile_image?: string;

  @Field({ nullable: true })
  display_name?: string;
}
