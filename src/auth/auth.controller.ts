import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  @Post('login')
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

  @Post('api/login')
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

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('api/register')
  async registerApi(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/user/me')
  getProfileApi(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/role')
  getUserRole(@Request() req) {
    return {
      role: req.user.role,
      isAdmin: req.user.role === 'admin',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/user/role')
  getUserRoleApi(@Request() req) {
    return {
      role: req.user.role,
      isAdmin: req.user.role === 'admin',
    };
  }

  @Post('api/forgot-password')
  async forgotPassword(@Body() body: { username: string }) {
    const username = (body?.username || '').trim();
    if (!username) {
      return { message: 'Username (email) is required' };
    }

    const genericResponse: any = { message: 'If the account exists, a reset email has been sent' };

    const resetUrl = `${process.env.PUBLIC_WEB_URL || 'http://localhost:3001'}/reset?u=${encodeURIComponent(username)}`;
    try {
      const res = await this.mailService.sendPasswordResetEmail(username, { username, resetUrl });
      if (res?.preview) {
        genericResponse.preview = res.preview;
        genericResponse.messageId = res.messageId;
      }
    } catch {}
    return genericResponse;
  }
}
