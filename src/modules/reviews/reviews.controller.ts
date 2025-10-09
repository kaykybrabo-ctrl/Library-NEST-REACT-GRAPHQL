import { Controller, Post, Get, Body, Param, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { JwtAuthGuard } from "@/modules/auth/jwt-auth.guard";

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post("api/reviews")
  async create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get("api/books/:id/reviews")
  async getBookReviews(@Param("id") bookId: string) {
    return this.reviewsService.findByBook(+bookId);
  }

  @Get("api/books/:id/rating")
  async getBookRating(@Param("id") bookId: string) {
    return this.reviewsService.getBookRating(+bookId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("api/books/:id/my-review")
  async getMyReview(@Param("id") bookId: string, @Request() req) {
    return this.reviewsService.findUserReview(req.user.id, +bookId);
  }
}
