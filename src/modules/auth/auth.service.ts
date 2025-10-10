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
    const dbUser = await this.usersService.findByUsername(username);
    
    if (!dbUser) {
      return null;
    }
    
    const user = {
      id: dbUser.user_id || dbUser.id,
      username: dbUser.username,
      role: dbUser.role,
      full_name: dbUser.username,
      user_id: dbUser.user_id || dbUser.id
    };
    
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
      throw new ConflictException("E-mail já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      username: registerDto.username,
      password: hashedPassword,
      role: "user",
    });

    return { message: "Conta criada com sucesso" };
  }
}
