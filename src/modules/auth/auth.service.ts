import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log('🔍 Tentando validar usuário:', username);
    
    try {
      const dbUser = await this.usersService.findByUsername(username);
      console.log('👤 Usuário encontrado:', dbUser ? 'SIM' : 'NÃO');
      
      if (!dbUser) {
        console.log('❌ Usuário não encontrado');
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(password, dbUser.password);
      console.log('🔐 Senha válida:', isPasswordValid ? 'SIM' : 'NÃO');
      
      if (!isPasswordValid) {
        console.log('❌ Senha inválida');
        return null;
      }
      
      console.log('✅ Validação bem-sucedida');
      return dbUser;
    } catch (error) {
      console.error('💥 Erro na validação:', error);
      throw error;
    }
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
      throw new ConflictException("E-mail já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      username: registerDto.username,
      password: hashedPassword,
      role: "user",
    });

    const userForLogin = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    return userForLogin;
  }
}
