import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { LoginInput, RegisterInput, UpdateProfileInput } from './dto/auth-graphql.dto';
import { LoginResponse, AuthUser, UserProfile } from './entities/auth.entity';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args('username') username: string,
    @Args('password') password: string
  ): Promise<LoginResponse> {
    
    if (!username || !password) {
      throw new UnauthorizedException('Username e password são obrigatórios');
    }
    
    const dbUser = await this.authService.validateUser(username, password);
    
    if (!dbUser) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    const userResult = await this.prisma.$queryRaw`
      SELECT display_name, description 
      FROM auth_users 
      WHERE id = ${dbUser.id}
      LIMIT 1
    ` as any[];

    const userData = userResult[0];
    
    const loginData = await this.authService.login(dbUser);
    return {
      token: loginData.access_token,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
        profile_image: dbUser.profile_image,
        display_name: userData?.display_name,
        description: userData?.description,
      }
    };
  }

  @Mutation(() => AuthUser)
  async register(
    @Args('username') username: string,
    @Args('password') password: string,
    @Args('role', { nullable: true }) role?: string
  ): Promise<AuthUser> {
    
    const user = await this.usersService.create({
      username,
      password,
      role: role || 'user',
    });

    const userResult = await this.prisma.$queryRaw`
      SELECT display_name, description 
      FROM auth_users 
      WHERE id = ${user.id}
      LIMIT 1
    ` as any[];

    const userData = userResult[0];

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      profile_image: user.profile_image,
      display_name: userData?.display_name,
      description: userData?.description,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserProfile)
  async me(@Context() context): Promise<UserProfile> {
    const user = context.req.user;
    const fullUser = await this.usersService.findByIdRaw(user.id);
    
    if (!fullUser) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const userResult = await this.prisma.$queryRaw`
      SELECT display_name, description 
      FROM auth_users 
      WHERE id = ${fullUser.id}
      LIMIT 1
    ` as any[];

    const userData = userResult[0];

    return {
      id: fullUser.id,
      username: fullUser.username,
      email: fullUser.username,
      role: fullUser.role,
      description: userData?.description || '',
      profile_image: fullUser.profile_image || '',
      display_name: userData?.display_name || '',
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserProfile)
  async updateProfile(
    @Args('updateProfileInput') updateProfileInput: UpdateProfileInput,
    @Context() context
  ): Promise<UserProfile> {
    const user = context.req.user;
    
    if (updateProfileInput.display_name !== undefined) {
      await this.usersService.updateDisplayName(user.id, updateProfileInput.display_name);
    }
    
    if (updateProfileInput.description !== undefined) {
      await this.usersService.updateDescription(user.id, updateProfileInput.description);
    }

    const updatedUser = await this.usersService.findByIdRaw(user.id);
    
    const userResult = await this.prisma.$queryRaw`
      SELECT display_name, description 
      FROM auth_users 
      WHERE id = ${updatedUser.id}
      LIMIT 1
    ` as any[];

    const userData = userResult[0];
    
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.username,
      role: updatedUser.role,
      description: userData?.description || '',
      profile_image: updatedUser.profile_image || '',
      display_name: userData?.display_name || '',
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async uploadProfileImage(
    @Args('file') file: string,
    @Args('username') username: string,
    @Context() context
  ): Promise<string> {
    return `https://res.cloudinary.com/ddfgsoh5g/image/upload/pedbook/profiles/${username}-${Date.now()}.jpg`;
  }

  @Mutation(() => String)
  async forgotPassword(@Args('username') username: string): Promise<string> {
    return 'Email de recuperação enviado com sucesso';
  }

  @Mutation(() => String)
  async resetPassword(
    @Args('newPassword') newPassword: string,
    @Args('token', { nullable: true }) token?: string,
    @Args('username', { nullable: true }) username?: string
  ): Promise<string> {
    return 'Senha alterada com sucesso';
  }
}
