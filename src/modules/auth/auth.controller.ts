import {
  Controller,
  Post,
  Body,
} from "@nestjs/common";
import { MailService } from "@/infrastructure/mail/mail.service";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "@/modules/users/users.service";

@Controller('api')
export class AuthController {
  constructor(
    private mailService: MailService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  @Post("forgot-password")
  async forgotPassword(@Body() body: { username: string }) {
    const username = (body?.username || "").trim();
    
    if (!username) {
      return {
        success: false,
        message: "E-mail é obrigatório"
      };
    }

    try {
      const user = await this.usersService.findByUsername(username);
      
      if (!user) {
        return {
          success: true,
          message: "Se o e-mail existir em nossa base, você receberá as instruções de recuperação."
        };
      }

      const resetToken = this.jwtService.sign(
        { username: user.username, type: 'password-reset' },
        { expiresIn: '1h' }
      );

      const resetUrl = `${process.env.PUBLIC_WEB_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(username)}`;

      await this.mailService.sendPasswordResetEmail(username, { username, resetUrl });

      return {
        success: true,
        message: "Se o e-mail existir em nossa base, você receberá as instruções de recuperação."
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro interno. Tente novamente mais tarde."
      };
    }
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const { newPassword, token, username } = dto;
    
    if (!newPassword || newPassword.length < 3) {
      return {
        success: false,
        message: "Senha deve ter pelo menos 3 caracteres"
      };
    }

    try {
      if (token) {
        const decoded = this.jwtService.verify(token);
        if (decoded.type !== 'password-reset') {
          return {
            success: false,
            message: "Token inválido"
          };
        }
        
        const user = await this.usersService.findByUsername(decoded.username);
        if (!user) {
          return {
            success: false,
            message: "Usuário não encontrado"
          };
        }

        await this.usersService.updatePassword(user.id.toString(), newPassword);
        
        return {
          success: true,
          message: "Senha alterada com sucesso"
        };
      } else if (username) {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
          return {
            success: false,
            message: "Usuário não encontrado"
          };
        }

        await this.usersService.updatePassword(user.id.toString(), newPassword);
        
        return {
          success: true,
          message: "Senha alterada com sucesso"
        };
      } else {
        return {
          success: false,
          message: "Token ou username é obrigatório"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro ao redefinir senha"
      };
    }
  }
}
