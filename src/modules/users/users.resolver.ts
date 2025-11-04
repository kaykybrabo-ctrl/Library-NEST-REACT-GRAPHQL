import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { FavoriteResponse, UserFavorite } from './entities/favorite.entity';
import { UserProfile } from '../auth/entities/auth.entity';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FavoriteResponse)
  async addToFavorites(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Context() context
  ): Promise<FavoriteResponse> {
    try {
      const user = context.req.user;
      await this.usersService.setFavoriteBook(user.id, bookId);
      return {
        success: true,
        message: 'Livro adicionado aos favoritos com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao adicionar livro aos favoritos',
      };
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserFavorite)
  async myFavoriteBook(@Context() context): Promise<UserFavorite> {
    const user = context.req.user;
    const favoriteBook = await this.usersService.getFavoriteBook(user.username);
    return {
      favoriteBook,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserProfile)
  async userProfile(
    @Args('username') username: string,
    @Context() context
  ): Promise<UserProfile> {
    const user = context.req.user;
    
    // Buscar usuário no banco
    const targetUser = await this.prisma.authUser.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        role: true,
        profile_image: true,
        display_name: true,
        description: true,
      }
    });

    if (!targetUser) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: targetUser.id,
      username: targetUser.username,
      email: targetUser.username, // Usando username como email
      role: targetUser.role,
      description: targetUser.description || '',
      profile_image: targetUser.profile_image || '',
      display_name: targetUser.display_name || '',
    };
  }
}
