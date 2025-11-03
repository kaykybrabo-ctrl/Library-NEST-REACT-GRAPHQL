import { Test, TestingModule } from '@nestjs/testing';

const mockAuthorsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  count: jest.fn(),
  updatePhoto: jest.fn(),
  restore: jest.fn(),
};

const mockCloudinaryService = {
  uploadImage: jest.fn(),
};

class MockAuthorsService {
  constructor(
    private repository: any,
    private cloudinaryService: any
  ) {}

  async create(createAuthorDto: any) {
    return this.repository.create(createAuthorDto);
  }

  async findAll(page?: number, limit?: number) {
    return this.repository.findAll(page, limit);
  }

  async findOne(id: number) {
    return this.repository.findById(id);
  }

  async update(id: number, updateAuthorDto: any) {
    const author = await this.repository.findById(id);
    if (!author) {
      throw new Error('Autor não encontrado');
    }
    return this.repository.update(id, updateAuthorDto);
  }

  async remove(id: number) {
    const author = await this.repository.findById(id);
    if (!author) {
      throw new Error('Autor não encontrado');
    }
    return this.repository.softDelete(id);
  }

  async count() {
    return this.repository.count({ deleted_at: null });
  }

  async updatePhoto(id: number, file: any) {
    try {
      const cloudinaryUrl = await this.cloudinaryService.uploadImage(file);
      return this.repository.updatePhoto(id, cloudinaryUrl);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
    }
  }

  async restore(id: number) {
    const author = await this.repository.findById(id);
    if (!author) {
      throw new Error('Autor não encontrado');
    }
    return this.repository.restore(id);
  }
}

describe('AuthorsService (Simplified)', () => {
  let service: MockAuthorsService;
  let repository: jest.Mocked<any>;
  let cloudinaryService: jest.Mocked<any>;

  const mockAuthor = {
    author_id: 1,
    name_author: 'Test Author',
    biography: 'Test Biography',
    photo: null,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    repository = mockAuthorsRepository as jest.Mocked<any>;
    cloudinaryService = mockCloudinaryService as jest.Mocked<any>;
    service = new MockAuthorsService(repository, cloudinaryService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an author successfully', async () => {
      const createAuthorDto = {
        name_author: 'New Author',
        biography: 'New Biography',
      };
      repository.create.mockResolvedValue(mockAuthor);

      const result = await service.create(createAuthorDto);

      expect(repository.create).toHaveBeenCalledWith(createAuthorDto);
      expect(result).toBeDefined();
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('findAll', () => {
    it('should return all authors with pagination', async () => {
      const mockAuthors = [mockAuthor];
      repository.findAll.mockResolvedValue(mockAuthors);

      const result = await service.findAll(1, 10);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockAuthors);
    });

    it('should return all authors without pagination', async () => {
      const mockAuthors = [mockAuthor];
      repository.findAll.mockResolvedValue(mockAuthors);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockAuthors);
    });
  });

  describe('findOne', () => {
    it('should return an author by id', async () => {
      repository.findById.mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAuthor);
    });

    it('should return null when author not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(repository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an author successfully', async () => {
      const updateAuthorDto = {
        name_author: 'Updated Author',
        biography: 'Updated Biography',
      };
      repository.findById.mockResolvedValue(mockAuthor);
      repository.update.mockResolvedValue({ ...mockAuthor, ...updateAuthorDto });

      const result = await service.update(1, updateAuthorDto);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateAuthorDto);
      expect(result).toBeDefined();
    });

    it('should throw error when author not found', async () => {
      const updateAuthorDto = {
        name_author: 'Updated Author',
      };
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateAuthorDto)).rejects.toThrow(
        'Autor não encontrado',
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete an author successfully', async () => {
      repository.findById.mockResolvedValue(mockAuthor);

      await service.remove(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw error when author not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Autor não encontrado');
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('should return count of non-deleted authors', async () => {
      repository.count.mockResolvedValue(5);

      const result = await service.count();

      expect(repository.count).toHaveBeenCalledWith({ deleted_at: null });
      expect(result).toBe(5);
    });
  });

  describe('updatePhoto', () => {
    it('should update author photo successfully', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      };
      const cloudinaryUrl = 'https://cloudinary.com/test.jpg';
      cloudinaryService.uploadImage.mockResolvedValue(cloudinaryUrl);

      await service.updatePhoto(1, mockFile);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(repository.updatePhoto).toHaveBeenCalledWith(1, cloudinaryUrl);
    });

    it('should throw error when cloudinary upload fails', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      };
      const uploadError = new Error('Upload failed');
      cloudinaryService.uploadImage.mockRejectedValue(uploadError);

      await expect(service.updatePhoto(1, mockFile)).rejects.toThrow(
        'Erro ao fazer upload da imagem: Upload failed',
      );
      expect(repository.updatePhoto).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore a deleted author', async () => {
      repository.findById.mockResolvedValue(mockAuthor);

      await service.restore(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.restore).toHaveBeenCalledWith(1);
    });

    it('should throw error when author not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow('Autor não encontrado');
      expect(repository.restore).not.toHaveBeenCalled();
    });
  });
});
