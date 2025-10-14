import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

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

  // ========== FIELD RESOLVERS (Relacionamentos) ==========

  @ResolveField('author', () => require('../authors/entities/author.entity').Author, { nullable: true })
  async author(@Parent() book: Book) {
    if (!book.author_id) return null;
    return this.prisma.author.findUnique({
      where: { author_id: book.author_id },
    });
  }
}