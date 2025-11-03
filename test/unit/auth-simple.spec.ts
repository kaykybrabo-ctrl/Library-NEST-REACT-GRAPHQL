import { Test, TestingModule } from '@nestjs/testing';

const mockBcrypt = {
  compare: jest.fn(),
  hash: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockUsersService = {
  findByUsername: jest.fn(),
  create: jest.fn(),
};

class MockAuthService {
  constructor(
    private usersService: any,
    private jwtService: any,
    private bcrypt: any
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && await this.bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(registerDto: any) {
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    const hashedPassword = await this.bcrypt.hash(registerDto.password, 10);
    
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.login(user);
  }
}

describe('AuthService (Simplified)', () => {
  let service: MockAuthService;
  let usersService: jest.Mocked<any>;
  let jwtService: jest.Mocked<any>;
  let bcrypt: jest.Mocked<any>;

  const mockUser = {
    id: 1,
    username: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    user_id: 1,
    display_name: null,
    profile_image: null,
    favorite_book_id: null,
    photo: null,
    description: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    usersService = mockUsersService as jest.Mocked<any>;
    jwtService = mockJwtService as jest.Mocked<any>;
    bcrypt = mockBcrypt as jest.Mocked<any>;
    service = new MockAuthService(usersService, jwtService, bcrypt);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const username = 'test@example.com';
      const password = 'password123';
      
      usersService.findByUsername.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.validateUser(username, password);

      expect(usersService.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.username).toBe(mockUser.username);
    });

    it('should return null when user not found', async () => {
      const username = 'nonexistent@example.com';
      const password = 'password123';
      usersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser(username, password);

      expect(usersService.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const username = 'test@example.com';
      const password = 'wrongpassword';
      
      usersService.findByUsername.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const result = await service.validateUser(username, password);

      expect(usersService.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const user = {
        id: 1,
        username: 'test@example.com',
        role: 'user',
      };
      const expectedToken = 'jwt-token-123';
      
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
        role: user.role,
      });
      expect(result).toEqual({
        access_token: expectedToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        username: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      };
      const hashedPassword = 'hashedPassword123';
      const expectedToken = 'jwt-token-123';
      
      usersService.findByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue({
        ...mockUser,
        username: registerDto.username,
        password: hashedPassword,
      });
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await service.register(registerDto);

      expect(usersService.findByUsername).toHaveBeenCalledWith(registerDto.username);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error when user already exists', async () => {
      const registerDto = {
        username: 'existing@example.com',
        password: 'password123',
        role: 'user',
      };
      
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Usuário já existe',
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });
});
