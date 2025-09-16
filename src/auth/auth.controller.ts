import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

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
}
