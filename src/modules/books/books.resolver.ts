import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { GqlAdminGuard } from '@/common/guards/gql-admin.guard';
import { Upload } from '@/common/scalars/upload.scalar';
import { Author } from '../authors/entities/author.entity';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

@Resolver(() => Book)
export class BooksResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [Book], { name: 'books' })
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('search', { nullable: true }) search?: string,
    @Args('includeDeleted', { nullable: true }) includeDeleted?: boolean,
  ) {
    const result = await this.booksService.findAll(page, limit, search, includeDeleted);
    return result.books;
  }

  @Query(() => Book, { name: 'book' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.booksService.findOne(id);
  }

  @Query(() => Int, { name: 'booksCount' })
  async count() {
    return this.booksService.count();
  }

  @Mutation(() => Book)
  async createBook(@Args('createBookInput') createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Mutation(() => Book)
  async updateBook(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateBookInput') updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Mutation(() => Boolean)
  async removeBook(@Args('id', { type: () => Int }) id: number) {
    await this.booksService.remove(id);
    return true;
  }

  @Mutation(() => Boolean)
  async restoreBook(@Args('id', { type: () => Int }) id: number) {
    await this.booksService.restore(id);
    return true;
  }

  @UseGuards(GqlAuthGuard, GqlAdminGuard)
  @Mutation(() => Book)
  async uploadBookImage(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('filename') filename: string,
    @Args('fileData') fileData: string
  ): Promise<Book> {
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

    const extension = filename.split('.').pop();
    const uniqueFilename = `${uuid()}.${extension}`;
    const uploadPath = join(process.cwd(), 'FRONTEND', 'uploads', uniqueFilename);

    const base64Data = fileData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(uploadPath);
      writeStream.write(buffer);
      writeStream.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    const updatedBook = await this.prisma.book.update({
      where: { book_id: bookId },
      data: { photo: uniqueFilename },
      include: {
        author: true,
      },
    });

    return {
      book_id: updatedBook.book_id,
      title: updatedBook.title,
      description: updatedBook.description,
      photo: updatedBook.photo,
      deleted_at: updatedBook.deleted_at,
      author_id: updatedBook.author_id,
      author: updatedBook.author ? {
        author_id: updatedBook.author.author_id,
        name_author: updatedBook.author.name_author,
        biography: updatedBook.author.biography,
        photo: updatedBook.author.photo,
        deleted_at: updatedBook.author.deleted_at,
      } : undefined,
    };
  }

  @ResolveField('author', () => Author, { nullable: true })
  async author(@Parent() book: Book) {
    if (!book.author_id) return null;
    return this.prisma.author.findUnique({
      where: { author_id: book.author_id },
    });
  }
}