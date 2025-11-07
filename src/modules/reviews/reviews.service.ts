import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { ReviewsRepository } from "./reviews.repository";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private reviewsRepository: ReviewsRepository,
  ) {}

  async create(userId: number, createReviewDto: CreateReviewDto) {
    const existing = await this.reviewsRepository.findByUserAndBook(userId, createReviewDto.book_id);
    
    if (existing) {
      return this.reviewsRepository.update(existing.id, {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      });
    }
    
    return this.reviewsRepository.create({
      user: {
        connect: { id: userId }
      },
      book: {
        connect: { book_id: createReviewDto.book_id }
      },
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });
  }

  async findByBook(bookId: number) {
    const reviews = await this.reviewsRepository.findByBookId(bookId) as any[];

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
        finalName = email || 'User';
      }
      
      return {
        ...review,
        user: {
          ...review.user,
          username: username,
          display_name: displayName,
        },
      };
    }));
  }

  async getBookRating(bookId: number) {
    return this.reviewsRepository.getBookRating(bookId);
  }

  async findUserReview(userId: number, bookId: number) {
    return this.reviewsRepository.findByUserAndBook(userId, bookId);
  }
}
