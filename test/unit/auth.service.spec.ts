import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UsersService } from '../../src/modules/users/users.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService - Testes Unitários', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 1,
    user_id: 1,
    username: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    profile_image: null,
    created_at: new Date(),
    photo: null,
    description: null,
    display_name: null,
    favorite_book_id: null,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('deve validar usuário com credenciais corretas', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(usersService.findByUsername).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando usuário não existe', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('deve retornar null quando senha está incorreta', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('deve gerar token JWT e retornar dados do usuário', async () => {
      const mockToken = 'jwt.token.here';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: mockToken,
        role: mockUser.role,
        username: mockUser.username,
        id: mockUser.id,
      });
    });
  });

  describe('register', () => {
    it('deve registrar novo usuário com sucesso', async () => {
      const registerDto = {
        username: 'newuser@example.com',
        password: 'password123',
      };
      const newUser = { ...mockUser, id: 2, username: registerDto.username };
      
      usersService.findByUsername.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      usersService.create.mockResolvedValue(newUser);

      const result = await service.register(registerDto);

      expect(usersService.findByUsername).toHaveBeenCalledWith(registerDto.username);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(result).toHaveProperty('username', registerDto.username);
      expect(result).toHaveProperty('id', 2);
    });

    it('deve lançar erro quando usuário já existe', async () => {
      const registerDto = {
        username: 'existing@example.com',
        password: 'password123',
      };
      
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(registerDto))
        .rejects.toThrow('E-mail já cadastrado');
    });
  });
});
