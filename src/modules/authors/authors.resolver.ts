import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CloudinaryService } from '@/common/services/cloudinary.service';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { GqlAdminGuard } from '@/common/guards/gql-admin.guard';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Query(() => [Author], { name: 'authors' })
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('includeDeleted', { nullable: true }) includeDeleted?: boolean,
  ) {
    const result = await this.authorsService.findAll(page, limit, includeDeleted);
    return result.authors;
  }

  @Query(() => Author, { name: 'author' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOne(id);
  }

  @Query(() => Int, { name: 'authorsCount' })
  async count() {
    return this.authorsService.count();
  }

  @Mutation(() => Author)
  async createAuthor(@Args('createAuthorInput') createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Mutation(() => Author)
  async updateAuthor(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateAuthorInput') updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Mutation(() => Boolean)
  async removeAuthor(@Args('id', { type: () => Int }) id: number) {
    await this.authorsService.remove(id);
    return true;
  }

  @Mutation(() => Boolean)
  async restoreAuthor(@Args('id', { type: () => Int }) id: number) {
    await this.authorsService.restore(id);
    return true;
  }

  @UseGuards(GqlAuthGuard, GqlAdminGuard)
  @Mutation(() => Author)
  async uploadAuthorImage(
    @Args('authorId', { type: () => Int }) authorId: number,
    @Args('filename') filename: string,
    @Args('fileData') fileData: string
  ): Promise<Author> {
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
      
      const updatedAuthor = await this.prisma.author.update({
        where: { author_id: authorId },
        data: { photo: cloudinaryUrl },
      });

      return {
        author_id: updatedAuthor.author_id,
        name_author: updatedAuthor.name_author,
        biography: updatedAuthor.biography,
        photo: updatedAuthor.photo,
        deleted_at: updatedAuthor.deleted_at,
      };
    } catch (error) {
      throw new Error(`Erro no upload da imagem: ${error.message}`);
    }
  }

  @Mutation(() => String)
  async uploadAuthorImagePureGraphQL(
    @Args('authorId', { type: () => Int }) authorId: number,
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
        originalname: `author-${authorId}-${Date.now()}.${ext}`,
        mimetype: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        size: buffer.length,
      } as Express.Multer.File;

      const cloudinaryUrl = await this.cloudinaryService.uploadImage(
        mockFile,
        'pedbook/profiles'
      );

      await this.prisma.author.update({
        where: { author_id: authorId },
        data: { photo: cloudinaryUrl }
      });

      return `✅ Imagem enviada com sucesso!`;
    } catch (error) {
      throw new Error(`❌ Erro no upload: ${error.message}`);
    }
  }

  @ResolveField('books', () => [require('../books/entities/book.entity').Book], { nullable: true })
  async books(@Parent() author: Author) {
    return this.prisma.book.findMany({
      where: { 
        author_id: author.author_id,
      },
    });
  }
}
