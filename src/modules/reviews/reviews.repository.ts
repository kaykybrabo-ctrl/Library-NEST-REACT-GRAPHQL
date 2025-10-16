import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Review, Prisma } from '@prisma/client';
import { DatabaseOperationException } from '@/common/exceptions/custom.exception';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    try {
      return await this.prisma.review.create({
        data,
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('criar avaliação', error.message);
    }
  }

  async findByBookId(bookId: number): Promise<Review[]> {
    try {
      return await this.prisma.review.findMany({
        where: { book_id: bookId },
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar avaliações do livro', error.message);
    }
  }

  async findByUserAndBook(userId: number, bookId: number): Promise<Review | null> {
    try {
      return await this.prisma.review.findFirst({
        where: {
          user_id: userId,
          book_id: bookId,
        },
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar avaliação do usuário', error.message);
    }
  }

  async findById(id: number): Promise<Review | null> {
    try {
      return await this.prisma.review.findUnique({
        where: { id },
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar avaliação por ID', error.message);
    }
  }

  async update(id: number, data: Prisma.ReviewUpdateInput): Promise<Review> {
    try {
      return await this.prisma.review.update({
        where: { id },
        data,
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar avaliação', error.message);
    }
  }

  async delete(id: number): Promise<Review> {
    try {
      return await this.prisma.review.delete({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseOperationException('excluir avaliação', error.message);
    }
  }

  async getBookRating(bookId: number): Promise<{ averageRating: number; totalReviews: number }> {
    try {
      const result = await this.prisma.review.aggregate({
        where: { book_id: bookId },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      return {
        averageRating: result._avg.rating || 0,
        totalReviews: result._count.id,
      };
    } catch (error) {
      throw new DatabaseOperationException('calcular rating do livro', error.message);
    }
  }
}
