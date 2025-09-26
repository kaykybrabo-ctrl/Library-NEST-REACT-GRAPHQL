import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UsersService } from "@/modules/users/users.service";
import { MailService } from "@/infrastructure/mail/mail.service";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtService } from "@nestjs/jwt";

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    const loginData = await this.authService.login(req.user);
    return {
      token: loginData.access_token,
      user: {
        id: loginData.id,
        username: loginData.username,
        role: loginData.role,
      },
    };
  }

  @Post("api/login")
  @UseGuards(LocalAuthGuard)
  async loginApi(@Request() req, @Body() loginDto: LoginDto) {
    const loginData = await this.authService.login(req.user);
    return {
      token: loginData.access_token,
      user: {
        id: loginData.id,
        username: loginData.username,
        role: loginData.role,
      },
    };
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("api/register")
  async registerApi(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("user/me")
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get("api/user/me")
  getProfileApi(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get("user/role")
  getUserRole(@Request() req) {
    return {
      role: req.user.role,
      isAdmin: req.user.role === "admin",
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("api/user/role")
  getUserRoleApi(@Request() req) {
    return {
      role: req.user.role,
      isAdmin: req.user.role === "admin",
    };
  }

  @Post("api/forgot-password")
  async forgotPassword(@Body() body: { username: string }) {
    const username = (body?.username || "").trim();
    if (!username) {
      return { message: "Nome de usuário (e-mail) é obrigatório" };
    }

    const genericResponse: any = {
      message: "Se a conta existir, um e-mail de redefinição foi enviado",
    };

    const token = this.jwtService.sign(
      { username, purpose: "pwd_reset" },
      { expiresIn: "15m" },
    );
    const resetUrl = `${process.env.PUBLIC_WEB_URL || "http://localhost:3001"}/reset?u=${encodeURIComponent(username)}&t=${encodeURIComponent(token)}`;
    try {
      const res = await this.mailService.sendPasswordResetEmail(username, {
        username,
        resetUrl,
      });
      if (res?.preview) {
        genericResponse.preview = res.preview;
        genericResponse.messageId = res.messageId;
      }
    } catch {}
    return genericResponse;
  }

  @Post("api/reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto, @Request() req) {
    const newPassword = (dto?.newPassword || "").trim();
    if (!newPassword) {
      return { ok: false, message: "Nova senha é obrigatória" };
    }

    let username = (dto?.username || "").trim().toLowerCase();
    const token = (dto?.token || "").trim();

    if (token) {
      try {
        const payload: any = this.jwtService.verify(token);
        if (payload?.purpose !== "pwd_reset") {
          return { ok: false, message: "Token inválido" };
        }
        username = (payload?.username || "").toLowerCase();
      } catch {
        return { ok: false, message: "Token inválido ou expirado" };
      }
    }

    if (!username) {
      return { ok: false, message: "Usuário ou token é obrigatório" };
    }

    try {
      const user = await this.usersService.findByUsername(username);
      if (!user) {
        return {
          ok: true,
          message: "A senha foi atualizada caso a conta exista",
        };
      }
      await this.usersService.updatePasswordByUsername(username, newPassword);
      return { ok: true, message: "Senha atualizada com sucesso" };
    } catch (e) {
      return { ok: false, message: "Falha ao redefinir a senha" };
    }
  }
}
