import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { ReviewsResolver } from "./reviews.resolver";
import { ReviewsRepository } from "./reviews.repository";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsResolver, ReviewsRepository],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
