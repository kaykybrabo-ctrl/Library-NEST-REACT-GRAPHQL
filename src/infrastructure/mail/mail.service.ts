import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import * as nodemailer from "nodemailer";
import * as pug from "pug";
import { join } from "path";
import { existsSync } from "fs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly jwtService: JwtService
  ) {}

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
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redefina sua senha</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
                          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; 
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .card { 
              max-width: 520px; 
              margin: 20px auto; 
              padding: 24px; 
              border: 1px solid #eee; 
              border-radius: 8px; 
              background-color: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .btn { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #162c74; 
              color: #fff; 
              text-decoration: none; 
              border-radius: 6px;
              font-weight: 500;
            }
            .btn:hover {
              background: #1a2f7a;
            }
            h2 {
              color: #162c74;
              margin-bottom: 20px;
            }
            p {
              line-height: 1.6;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Olá${context.username ? ` ${context.username}` : ''},</h2>
            <p>Recebemos uma solicitação para redefinir sua senha do <strong>PedBook</strong>.</p>
            <p>Clique no botão abaixo para escolher uma nova senha:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a class="btn" href="${context.resetUrl}" target="_blank" rel="noopener">Redefinir Senha</a>
            </p>
            <p><small>Ou copie e cole este link no seu navegador:</small><br>
               <a href="${context.resetUrl}" style="color: #162c74; word-break: break-all;">${context.resetUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p><small>Se você não solicitou isso, por favor ignore este e-mail.</small></p>
            <p><small>Este link irá expirar em 15 minutos por motivos de segurança.</small></p>
            <p style="margin-top: 30px;">
              Atenciosamente,<br>
              <strong>Equipe PedBook</strong>
            </p>
          </div>
        </body>
      </html>
    `;
    
    try {
      const emailPromise = this.mailer.sendMail({
        to,
        subject: "🔐 Redefina sua senha do PedBook",
        html,
        text: `Olá${context.username ? ` ${context.username}` : ''},

Recebemos uma solicitação para redefinir sua senha do PedBook.

Abra este link para continuar: ${context.resetUrl}

Se você não solicitou isso, por favor ignore este e-mail.
Este link irá expirar em 15 minutos por motivos de segurança.

Atenciosamente,
Equipe PedBook`,
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Email demorou mais de 10 segundos')), 10000);
      });
      
      const info = await Promise.race([emailPromise, timeoutPromise]) as any;
      
      const preview = nodemailer.getTestMessageUrl(info);
      
      return { 
        messageId: info?.messageId, 
        preview,
        success: true,
        message: 'Email enviado com sucesso'
      };
    } catch (err) {
      const devToken = this.jwtService.sign(
        { username: to, purpose: "pwd_reset" },
        { expiresIn: "15m" }
      );
      
      return {
        messageId: `dev-${Date.now()}`,
        preview: `http://localhost:8080/reset?u=${encodeURIComponent(to)}&t=${devToken}`,
        success: false,
        message: `Email não enviado (desenvolvimento): ${err?.message}`,
        error: err?.message
      };
    }
  }
}
