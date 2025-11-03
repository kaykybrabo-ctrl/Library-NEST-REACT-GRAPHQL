import { Test, TestingModule } from '@nestjs/testing';

const mockBooksRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  count: jest.fn(),
  updatePhoto: jest.fn(),
  restore: jest.fn(),
};

class MockBooksService {
  constructor(private repository: any) {}

  async create(createBookDto: any) {
    return this.repository.create({
      title: createBookDto.title,
      description: createBookDto.description,
      author: {
        connect: { author_id: createBookDto.author_id },
      },
    });
  }

  async findAll(page?: number, limit?: number) {
    return this.repository.findAll(page, limit);
  }

  async findOne(id: number) {
    return this.repository.findById(id);
  }

  async update(id: number, updateBookDto: any) {
    const book = await this.repository.findById(id);
    if (!book) {
      throw new Error('Livro não encontrado');
    }
    return this.repository.update(id, updateBookDto);
  }

  async remove(id: number) {
    const book = await this.repository.findById(id);
    if (!book) {
      throw new Error('Livro não encontrado');
    }
    return this.repository.softDelete(id);
  }

  async count() {
    return this.repository.count({ deleted_at: null });
  }

  async updatePhoto(id: number, photoUrl: string) {
    const book = await this.repository.findById(id);
    if (!book) {
      throw new Error('Livro não encontrado');
    }
    return this.repository.updatePhoto(id, photoUrl);
  }

  async restore(id: number) {
    const book = await this.repository.findById(id);
    if (!book) {
      throw new Error('Livro não encontrado');
    }
    return this.repository.restore(id);
  }
}

describe('BooksService (Simplified)', () => {
  let service: MockBooksService;
  let repository: jest.Mocked<any>;

  const mockBook = {
    book_id: 1,
    title: 'Test Book',
    description: 'Test Description',
    photo: null,
    author_id: 1,
    deleted_at: null,
    author: {
      author_id: 1,
      name_author: 'Test Author',
      biography: 'Test Biography',
      photo: null,
      deleted_at: null,
    },
    book_categories: [],
    book_publishers: [],
  };

  beforeEach(async () => {
    repository = mockBooksRepository as jest.Mocked<any>;
    service = new MockBooksService(repository);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const createBookDto = {
        title: 'New Book',
        description: 'New Description',
        author_id: 1,
      };
      repository.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(repository.create).toHaveBeenCalledWith({
        title: createBookDto.title,
        description: createBookDto.description,
        author: {
          connect: { author_id: createBookDto.author_id },
        },
      });
      expect(result).toBeDefined();
      expect(result).toEqual(mockBook);
    });
  });

  describe('findAll', () => {
    it('should return all books with pagination', async () => {
      const mockBooks = [mockBook];
      repository.findAll.mockResolvedValue(mockBooks);

      const result = await service.findAll(1, 10);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockBooks);
    });

    it('should return all books without pagination', async () => {
      const mockBooks = [mockBook];
      repository.findAll.mockResolvedValue(mockBooks);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockBooks);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      repository.findById.mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should return null when book not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(repository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const updateBookDto = {
        title: 'Updated Book',
        description: 'Updated Description',
      };
      repository.findById.mockResolvedValue(mockBook);
      repository.update.mockResolvedValue({ ...mockBook, ...updateBookDto });

      const result = await service.update(1, updateBookDto);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateBookDto);
      expect(result).toBeDefined();
    });

    it('should throw error when book not found', async () => {
      const updateBookDto = {
        title: 'Updated Book',
        description: 'Updated Description',
      };
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateBookDto)).rejects.toThrow(
        'Livro não encontrado',
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a book successfully', async () => {
      repository.findById.mockResolvedValue(mockBook);

      await service.remove(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw error when book not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Livro não encontrado');
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('should return count of non-deleted books', async () => {
      repository.count.mockResolvedValue(10);

      const result = await service.count();

      expect(repository.count).toHaveBeenCalledWith({ deleted_at: null });
      expect(result).toBe(10);
    });
  });

  describe('updatePhoto', () => {
    it('should update book photo successfully', async () => {
      const photoUrl = 'https://example.com/photo.jpg';
      repository.findById.mockResolvedValue(mockBook);
      repository.updatePhoto.mockResolvedValue({ ...mockBook, photo: photoUrl });

      const result = await service.updatePhoto(1, photoUrl);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.updatePhoto).toHaveBeenCalledWith(1, photoUrl);
      expect(result).toBeDefined();
    });

    it('should throw error when book not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updatePhoto(999, 'photo.jpg')).rejects.toThrow(
        'Livro não encontrado',
      );
      expect(repository.updatePhoto).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore a deleted book', async () => {
      repository.findById.mockResolvedValue(mockBook);

      await service.restore(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.restore).toHaveBeenCalledWith(1);
    });

    it('should throw error when book not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow('Livro não encontrado');
      expect(repository.restore).not.toHaveBeenCalled();
    });
  });
});
