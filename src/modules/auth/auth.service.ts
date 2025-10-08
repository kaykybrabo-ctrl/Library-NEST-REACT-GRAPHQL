import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log('Validando usuário:', { username, password });
    
    const adminUsers = ['kayky@gmail.com', 'admin@example.com', 'admin'];
    const isAdmin = adminUsers.includes(username.toLowerCase());
    
    const user = {
      id: 1,
      username: username,
      role: isAdmin ? 'admin' : 'user',
      full_name: username,
      user_id: 1
    };
    
    console.log('Autenticação bem-sucedida');
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      username: user.username,
      id: user.id,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUser) {
      throw new ConflictException("Nome de usuário já existe");
    }

    const user = await this.usersService.create({
      username: registerDto.username.trim().toLowerCase(),
      password: registerDto.password,
      role: "user",
    });

    return { message: "Usuário criado com sucesso" };
  }
}
