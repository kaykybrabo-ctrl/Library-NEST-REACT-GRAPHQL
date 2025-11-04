import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Book, Prisma } from '@prisma/client';
import { DatabaseOperationException } from '@/common/exceptions/custom.exception';

@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BookCreateInput): Promise<Book> {
    try {
      return await this.prisma.book.create({
        data,
        include: {
          author: true,
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('criar livro', error.message);
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BookWhereInput;
    orderBy?: Prisma.BookOrderByWithRelationInput;
  }): Promise<Book[]> {
    try {
      return await this.prisma.book.findMany({
        ...params,
        include: {
          author: true,
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar livros', error.message);
    }
  }

  async findById(id: number): Promise<Book | null> {
    try {
      return await this.prisma.book.findFirst({
        where: { book_id: id },
        include: {
          author: true,
          book_categories: {
            include: {
              categories: true,
            },
          },
          book_publishers: {
            include: {
              publishers: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar livro por ID', error.message);
    }
  }

  async findByTitleAndAuthor(title: string, authorId: number): Promise<Book | null> {
    try {
      return await this.prisma.book.findFirst({
        where: { 
          title: title,
          author_id: authorId,
          deleted_at: null
        },
        include: {
          author: true,
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar livro por título e autor', error.message);
    }
  }

  async update(id: number, data: Prisma.BookUpdateInput): Promise<Book> {
    try {
      return await this.prisma.book.update({
        where: { book_id: id },
        data,
        include: {
          author: true,
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar livro', error.message);
    }
  }

  async softDelete(id: number): Promise<Book> {
    try {
      return await this.prisma.book.update({
        where: { book_id: id },
        data: { deleted_at: new Date() } as any,
      });
    } catch (error) {
      throw new DatabaseOperationException('excluir livro', error.message);
    }
  }

  async restore(id: number): Promise<Book> {
    try {
      return await this.prisma.book.update({
        where: { book_id: id },
        data: { deleted_at: null } as any,
      });
    } catch (error) {
      throw new DatabaseOperationException('restaurar livro', error.message);
    }
  }

  async count(where?: Prisma.BookWhereInput): Promise<number> {
    try {
      return await this.prisma.book.count({ where });
    } catch (error) {
      throw new DatabaseOperationException('contar livros', error.message);
    }
  }

  async updatePhoto(id: number, photo: string): Promise<Book> {
    try {
      return await this.prisma.book.update({
        where: { book_id: id },
        data: { photo },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar foto do livro', error.message);
    }
  }
}
