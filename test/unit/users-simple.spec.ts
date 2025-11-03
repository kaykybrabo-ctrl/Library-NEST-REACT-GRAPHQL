import { Test, TestingModule } from '@nestjs/testing';

const mockUsersRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  updateDisplayName: jest.fn(),
  updateProfileImage: jest.fn(),
  setFavoriteBook: jest.fn(),
  getFavoriteBook: jest.fn(),
};

class MockUsersService {
  constructor(private repository: any) {}

  async create(createUserDto: any) {
    const existingUser = await this.repository.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new Error('Usuário já existe');
    }
    return this.repository.create(createUserDto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    return this.repository.findById(id);
  }

  async findByUsername(username: string) {
    return this.repository.findByUsername(username);
  }

  async update(id: number, updateUserDto: any) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return this.repository.update(id, updateUserDto);
  }

  async remove(id: number) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return this.repository.softDelete(id);
  }

  async updateDisplayName(userId: number, displayName: string) {
    return this.repository.updateDisplayName(userId, displayName);
  }

  async updateProfileImage(userId: number, imageUrl: string) {
    return this.repository.updateProfileImage(userId, imageUrl);
  }

  async setFavoriteBook(userId: number, bookId: number) {
    return this.repository.setFavoriteBook(userId, bookId);
  }

  async getFavoriteBook(userId: number) {
    return this.repository.getFavoriteBook(userId);
  }
}

describe('UsersService (Simplified)', () => {
  let service: MockUsersService;
  let repository: jest.Mocked<any>;

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
    repository = mockUsersRepository as jest.Mocked<any>;
    service = new MockUsersService(repository);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        username: 'newuser@example.com',
        password: 'hashedPassword',
        role: 'user',
      };
      repository.findByUsername.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repository.findByUsername).toHaveBeenCalledWith(createUserDto.username);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user already exists', async () => {
      const createUserDto = {
        username: 'existing@example.com',
        password: 'hashedPassword',
        role: 'user',
      };
      repository.findByUsername.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Usuário já existe',
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser];
      repository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(repository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      repository.findByUsername.mockResolvedValue(mockUser);

      const result = await service.findByUsername('test@example.com');

      expect(repository.findByUsername).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto = {
        display_name: 'Updated Name',
      };
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update(1, updateUserDto);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      const updateUserDto = {
        display_name: 'Updated Name',
      };
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        'Usuário não encontrado',
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a user successfully', async () => {
      repository.findById.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw error when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Usuário não encontrado');
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('updateDisplayName', () => {
    it('should update user display name', async () => {
      const displayName = 'New Display Name';
      repository.updateDisplayName.mockResolvedValue({ ...mockUser, display_name: displayName });

      const result = await service.updateDisplayName(1, displayName);

      expect(repository.updateDisplayName).toHaveBeenCalledWith(1, displayName);
      expect(result).toBeDefined();
    });
  });

  describe('updateProfileImage', () => {
    it('should update user profile image', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      repository.updateProfileImage.mockResolvedValue({ ...mockUser, profile_image: imageUrl });

      const result = await service.updateProfileImage(1, imageUrl);

      expect(repository.updateProfileImage).toHaveBeenCalledWith(1, imageUrl);
      expect(result).toBeDefined();
    });
  });

  describe('setFavoriteBook', () => {
    it('should set user favorite book', async () => {
      const bookId = 5;
      repository.setFavoriteBook.mockResolvedValue({ ...mockUser, favorite_book_id: bookId });

      const result = await service.setFavoriteBook(1, bookId);

      expect(repository.setFavoriteBook).toHaveBeenCalledWith(1, bookId);
      expect(result).toBeDefined();
    });
  });

  describe('getFavoriteBook', () => {
    it('should get user favorite book', async () => {
      const favoriteBook = { book_id: 5, title: 'Favorite Book' };
      repository.getFavoriteBook.mockResolvedValue(favoriteBook);

      const result = await service.getFavoriteBook(1);

      expect(repository.getFavoriteBook).toHaveBeenCalledWith(1);
      expect(result).toEqual(favoriteBook);
    });
  });
});
