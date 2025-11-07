import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { FavoriteResponse, UserFavorite } from './entities/favorite.entity';
import { UserProfile } from '../auth/entities/auth.entity';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [UserProfile])
  async users(@Context() context): Promise<UserProfile[]> {
    const allUsers = await this.prisma.authUser.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        profile_image: true,
        display_name: true,
        description: true,
      }
    });

    return allUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.username,
      role: user.role,
      description: user.description || '',
      profile_image: user.profile_image || '',
      display_name: user.display_name || '',
    }));
  }

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
      email: targetUser.username,
      role: targetUser.role,
      description: targetUser.description || '',
      profile_image: targetUser.profile_image || '',
      display_name: targetUser.display_name || '',
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserProfile)
  async uploadUserImage(
    @Args('username') username: string,
    @Args('filename') filename: string,
    @Args('fileData') fileData: string,
    @Context() context
  ): Promise<UserProfile> {
    const user = context.req.user;
    
    if (!filename) {
      throw new Error('Nome do arquivo é obrigatório');
    }
    
    if (!fileData) {
      throw new Error('Dados do arquivo são obrigatórios');
    }
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExt = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExt)) {
      throw new Error('Apenas arquivos de imagem são permitidos');
    }

    const base64Data = fileData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const mockFile = {
      buffer,
      mimetype: `image/${filename.split('.').pop()}`,
      originalname: filename,
    } as Express.Multer.File;

    try {
      const cloudinaryUrl = await this.cloudinaryService.uploadImage(
        mockFile,
        'pedbook/profiles'
      );
      
      const updatedUser = await this.prisma.authUser.update({
        where: { username },
        data: { profile_image: cloudinaryUrl },
      });

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.username,
        role: updatedUser.role,
        description: updatedUser.description || '',
        profile_image: updatedUser.profile_image || '',
        display_name: updatedUser.display_name || '',
      };
    } catch (error) {
      throw new Error(`Erro no upload da imagem: ${error.message}`);
    }
  }

  @Mutation(() => String)
  async uploadUserImagePureGraphQL(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('filename') filename: string,
    @Args('fileData') fileData: string,
  ): Promise<string> {
    try {
      if (!fileData.startsWith('data:image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos');
      }

      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const ext = filename.split('.').pop() || 'jpg';
      const mockFile = {
        buffer: buffer,
        originalname: `user-${userId}-${Date.now()}.${ext}`,
        mimetype: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        size: buffer.length,
      } as Express.Multer.File;

      const cloudinaryUrl = await this.cloudinaryService.uploadProfileImage(mockFile);

      await this.prisma.authUser.update({
        where: { id: userId },
        data: { profile_image: cloudinaryUrl }
      });

      return `✅ Imagem enviada com sucesso!`;
    } catch (error) {
      throw new Error(`❌ Erro no upload: ${error.message}`);
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async updateUserDescription(
    @Args('username') username: string,
    @Args('description') description: string,
    @Context() context
  ): Promise<string> {
    const user = context.req.user;
    
    await this.prisma.authUser.update({
      where: { username },
      data: { description },
    });

    return 'Descrição atualizada com sucesso';
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async updateUserDisplayName(
    @Args('username') username: string,
    @Args('displayName') displayName: string,
    @Context() context
  ): Promise<string> {
    const user = context.req.user;
    
    await this.prisma.authUser.update({
      where: { username },
      data: { display_name: displayName },
    });

    return 'Nome de exibição atualizado com sucesso';
  }
}
