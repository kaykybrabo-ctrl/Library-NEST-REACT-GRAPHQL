import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    const bookExists = await this.checkBookExists(createReviewDto.book_id);
    const userExists = await this.checkUserExists(createReviewDto.user_id);

    if (!bookExists) {
      throw new NotFoundException("Book not found");
    }

    if (!userExists) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.review.create({
      data: createReviewDto,
      include: {
        user: true,
        book: true,
      },
    });
  }

  async findAll(): Promise<any[]> {
    const reviews = await this.prisma.review.findMany({
      include: {
        user: true,
        book: true,
      },
      orderBy: {
        review_date: "desc",
      },
    });

    return reviews.map((review) => ({
      review_id: review.review_id,
      book_id: review.book_id,
      user_id: review.user_id,
      rating: review.rating,
      comment: review.comment,
      review_date: review.review_date,
      username: review.user.username,
      bookTitle: review.book.title,
    }));
  }

  private async checkBookExists(bookId: number): Promise<boolean> {
    const book = await this.prisma.book.findUnique({
      where: { book_id: bookId },
    });
    return !!book;
  }

  private async checkUserExists(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return !!user;
  }
}
