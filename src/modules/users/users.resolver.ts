import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { FavoriteResponse, UserFavorite } from './entities/favorite.entity';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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
}
