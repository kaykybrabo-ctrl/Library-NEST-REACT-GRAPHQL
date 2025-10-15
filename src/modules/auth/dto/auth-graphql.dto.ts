import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  role?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  display_name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  profile_image?: string;
}
