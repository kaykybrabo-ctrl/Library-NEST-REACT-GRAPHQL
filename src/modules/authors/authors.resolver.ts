import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly prisma: PrismaService,
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

  @ResolveField('books', () => [require('../books/entities/book.entity').Book], { nullable: true })
  async books(@Parent() author: Author) {
    return this.prisma.book.findMany({
      where: { 
        author_id: author.author_id,
      },
    });
  }
}
