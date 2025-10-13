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
      "infrastructure",
      "mail",
      "templates",
      "reset-password.pug",
    );
    
    console.log('📧 MailService: Enviando email para:', to);
    console.log('🔗 Reset URL:', context.resetUrl);
    
    try {
      const html = pug.compileFile(templatePath)(context);
      console.log('✅ Template HTML compilado com sucesso');
      
      const info = await this.mailer.sendMail({
        to,
        subject: "Redefina sua senha do PedBook",
        html,
        text: `Recebemos uma solicitação para redefinir sua senha do PedBook. Abra este link para continuar: ${context.resetUrl}`,
      });
      
      console.log('✅ Email enviado, messageId:', info?.messageId);
      
      const preview = nodemailer.getTestMessageUrl(info);
      console.log('🔗 Preview URL gerado:', preview);
      
      return { messageId: info?.messageId, preview };
    } catch (err) {
      console.error('⚠️ Erro ao compilar template, usando texto simples:', err?.message);
      
      const info2 = await this.mailer.sendMail({
        to,
        subject: "Redefina sua senha do PedBook",
        text: `Recebemos uma solicitação para redefinir sua senha do PedBook. Abra este link para continuar: ${context.resetUrl}`,
      });
      
      console.log('✅ Email de texto enviado, messageId:', info2?.messageId);
      
      const preview2 = nodemailer.getTestMessageUrl(info2);
      console.log('🔗 Preview URL gerado (fallback):', preview2);
      
      return { messageId: info2?.messageId, preview: preview2 };
    }
  }
}
