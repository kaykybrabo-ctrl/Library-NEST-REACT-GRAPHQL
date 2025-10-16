import { Module } from "@nestjs/common";
import { LoansService } from "./loans.service";
import { LoansController } from "./loans.controller";
import { LoansResolver } from "./loans.resolver";
import { LoansRepository } from "./loans.repository";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [LoansController],
  providers: [LoansService, LoansResolver, LoansRepository],
  exports: [LoansService, LoansRepository],
})
export class LoansModule {}
