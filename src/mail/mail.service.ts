import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import * as nodemailer from "nodemailer";
import * as pug from "pug";
import { join } from "path";

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendWelcomeEmail(to: string, context: { username: string }) {
    try {
      const info = await this.mailer.sendMail({
        to,
        subject: "Bem-vindo(a) ao PedBook",
        template: "welcome",
        context,
      });
      const preview = nodemailer.getTestMessageUrl(info);
      return { messageId: info?.messageId, preview };
    } catch (err) {
      throw err;
    }
  }

  async sendGeneric(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ) {
    try {
      const info = await this.mailer.sendMail({
        to,
        subject,
        template,
        context,
      });
      const preview = nodemailer.getTestMessageUrl(info);
      return { messageId: info?.messageId, preview };
    } catch (err) {
      throw err;
    }
  }

  async sendPasswordResetEmail(
    to: string,
    context: { username?: string; resetUrl: string },
  ) {
    const templatePath = join(
      process.cwd(),
      "src",
      "mail",
      "templates",
      "reset-password.pug",
    );
    try {
      const html = pug.compileFile(templatePath)(context);
      const info = await this.mailer.sendMail({
        to,
        subject: "Redefina sua senha do PedBook",
        html,
        text: `Recebemos uma solicitação para redefinir sua senha do PedBook. Abra este link para continuar: ${context.resetUrl}`,
      });
      const preview = nodemailer.getTestMessageUrl(info);
      return { messageId: info?.messageId, preview };
    } catch (err) {
      const info2 = await this.mailer.sendMail({
        to,
        subject: "Redefina sua senha do PedBook",
        text: `Recebemos uma solicitação para redefinir sua senha do PedBook. Abra este link para continuar: ${context.resetUrl}`,
      });
      const preview2 = nodemailer.getTestMessageUrl(info2);
      return { messageId: info2?.messageId, preview: preview2 };
    }
  }
}
