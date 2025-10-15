import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createReviewDto: CreateReviewDto) {
    return this.prisma.review.upsert({
      where: {
        user_id_book_id: {
          user_id: userId,
          book_id: createReviewDto.book_id,
        },
      },
      update: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
      create: {
        user_id: userId,
        book_id: createReviewDto.book_id,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
      include: {
        user: true,
        book: true,
      },
    });
  }

  async findByBook(bookId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { book_id: bookId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            photo: true,
            user_id: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return Promise.all(reviews.map(async review => {
      const authUserResult = await this.prisma.$queryRaw`
        SELECT display_name, username 
        FROM auth_users 
        WHERE id = ${review.user.id}
        LIMIT 1
      ` as any[];

      const authUser = authUserResult[0];
      const displayName = authUser?.display_name;
      const username = review.user.username;
      const email = review.user.user?.email;
      
      let finalName = displayName || username;
      
      if (!displayName && username && username.includes('@')) {
        finalName = username.split('@')[0];
      }
      
      if (!finalName) {
        finalName = email || 'Usuário';
      }
      
      return {
        ...review,
        user: {
          ...review.user,
          username: finalName,
        },
      };
    }));
  }

  async getBookRating(bookId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { book_id: bookId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    };
  }

  async findUserReview(userId: number, bookId: number) {
    return this.prisma.review.findUnique({
      where: {
        user_id_book_id: {
          user_id: userId,
          book_id: bookId,
        },
      },
    });
  }
}
