import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { UsersRepository } from '../../src/modules/users/users.repository';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';
import { CloudinaryService } from '../../src/common/services/cloudinary.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService - Testes Unitários', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let prismaService: any;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  const mockUser = {
    user_id: 1,
    full_name: 'Test User',
    birth_date: new Date('1990-01-01'),
    address: 'Test Address',
    email: 'test@example.com',
    profile_image: null,
    description: null,
    display_name: null,
    favorite_book_id: null,
  };

  const mockAuthUser = {
    id: 1,
    username: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    user_id: 1,
    profile_image: null,
    created_at: new Date(),
    photo: null,
    description: null,
    display_name: null,
    favorite_book_id: null,
  };

  beforeEach(async () => {
    const mockUsersRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateDisplayName: jest.fn(),
      updateProfileImage: jest.fn(),
      getFavoriteBook: jest.fn(),
    };

    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockCloudinaryService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
    prismaService = module.get(PrismaService);
    cloudinaryService = module.get(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      const createUserDto = {
        username: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      };

      usersRepository.findByUsername.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      usersRepository.create.mockResolvedValue(mockAuthUser);

      const result = await service.create(createUserDto);

      expect(usersRepository.findByUsername).toHaveBeenCalledWith(createUserDto.username);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(result).toEqual(mockAuthUser);
    });

    it('deve lançar erro quando username não é fornecido', async () => {
      const invalidDto = { username: '', password: 'password123', role: 'user' };

      await expect(service.create(invalidDto))
        .rejects.toThrow('Username é obrigatório');
    });

    it('deve lançar erro quando password não é fornecido', async () => {
      const invalidDto = { username: 'test@example.com', password: '', role: 'user' };

      await expect(service.create(invalidDto))
        .rejects.toThrow('Password é obrigatório');
    });

    it('deve lançar erro quando usuário já existe', async () => {
      const createUserDto = {
        username: 'existing@example.com',
        password: 'password123',
        role: 'user',
      };

      usersRepository.findByUsername.mockResolvedValue(mockAuthUser);

      await expect(service.create(createUserDto))
        .rejects.toThrow('Este nome de usuário já está em uso');
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      const mockUsers = [mockAuthUser];
      usersRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(usersRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('deve encontrar um usuário por ID', async () => {
      usersRepository.findById.mockResolvedValue(mockAuthUser);

      const result = await service.findOne(1);

      expect(usersRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('username', 'test@example.com');
    });

    it('deve retornar null quando usuário não existe', async () => {
      usersRepository.findById.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('deve encontrar usuário por username', async () => {
      usersRepository.findByUsername.mockResolvedValue(mockAuthUser);

      const result = await service.findByUsername('test@example.com');

      expect(usersRepository.findByUsername).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockAuthUser);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário', async () => {
      const updateDto = { username: 'updated@example.com' };
      const updatedUser = { ...mockAuthUser, username: 'updated@example.com' };
      
      usersRepository.findById.mockResolvedValue(mockAuthUser);
      usersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(result.username).toBe('updated@example.com');
    });

    it('deve lançar erro quando usuário não existe', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { username: 'test' }))
        .rejects.toThrow('Usuário não encontrado');
    });
  });

});
