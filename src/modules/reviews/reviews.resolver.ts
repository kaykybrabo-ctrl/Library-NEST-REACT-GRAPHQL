import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { Review, BookRating } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Review)
  async createReview(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('rating', { type: () => Int }) rating: number,
    @Args('comment', { nullable: true }) comment: string,
    @Context() context
  ): Promise<Review> {
    const user = context.req.user;
    const createReviewDto: CreateReviewDto = {
      book_id: bookId,
      rating,
      comment,
    };

    const review = await this.reviewsService.create(user.id, createReviewDto);
    
    return {
      id: review.id,
      user_id: review.user_id,
      book_id: review.book_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      user: review.user ? {
        username: review.user.username,
        photo: review.user.photo,
      } : undefined,
    };
  }

  @Query(() => [Review])
  async bookReviews(@Args('bookId', { type: () => Int }) bookId: number): Promise<Review[]> {
    const reviews = await this.reviewsService.findByBook(bookId);
    
    return reviews.map(review => ({
      id: review.id,
      user_id: review.user_id,
      book_id: review.book_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      user: review.user ? {
        username: review.user.username,
        photo: review.user.photo,
      } : undefined,
    }));
  }

  @Query(() => BookRating)
  async bookRating(@Args('bookId', { type: () => Int }) bookId: number): Promise<BookRating> {
    return this.reviewsService.getBookRating(bookId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Review, { nullable: true })
  async myBookReview(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Context() context
  ): Promise<Review | null> {
    const user = context.req.user;
    const review = await this.reviewsService.findUserReview(user.id, bookId);
    
    if (!review) return null;

    return {
      id: review.id,
      user_id: review.user_id,
      book_id: review.book_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
    };
  }
}
