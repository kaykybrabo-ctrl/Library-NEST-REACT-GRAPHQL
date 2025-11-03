import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { JwtModule } from "@nestjs/jwt";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    })
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
