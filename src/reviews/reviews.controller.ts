import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reviews')
  async findAll() {
    return this.reviewsService.findAll();
  }

  @Get('api/reviews')
  async findAllApi() {
    return this.reviewsService.findAll();
  }

  @Post('reviews')
  async create(@Body() createReviewDto: CreateReviewDto) {
    await this.reviewsService.create(createReviewDto);
    return { message: 'Review created successfully' };
  }

  @Post('api/reviews')
  async createApi(@Body() createReviewDto: CreateReviewDto) {
    await this.reviewsService.create(createReviewDto);
    return { message: 'Review created successfully' };
  }
}
