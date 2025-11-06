import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from '../../src/modules/books/books.service';
import { BooksRepository } from '../../src/modules/books/books.repository';
import { AuthorsService } from '../../src/modules/authors/authors.service';

describe('BooksService - Testes Unitários', () => {
  let service: BooksService;
  let booksRepository: jest.Mocked<BooksRepository>;
  let authorsService: jest.Mocked<AuthorsService>;

  const mockBook = {
    book_id: 1,
    title: 'Test Book',
    description: 'Test Description',
    photo: null,
    author_id: 1,
    deleted_at: null,
  };

  beforeEach(async () => {
    const mockBooksRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      count: jest.fn(),
    };

    const mockAuthorsService = {
      findByName: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: BooksRepository, useValue: mockBooksRepository },
        { provide: AuthorsService, useValue: mockAuthorsService },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    booksRepository = module.get(BooksRepository);
    authorsService = module.get(AuthorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um livro com sucesso', async () => {
      const createBookDto = { title: 'New Book', author_id: 1 };
      booksRepository.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(booksRepository.create).toHaveBeenCalledWith({
        title: createBookDto.title,
        author: { connect: { author_id: createBookDto.author_id } },
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('findOne', () => {
    it('deve encontrar um livro por ID', async () => {
      booksRepository.findById.mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(booksRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('book_id', 1);
      expect(result).toHaveProperty('title', 'Test Book');
      expect(result).toHaveProperty('author_id', 1);
    });

    it('deve retornar null quando livro não existe', async () => {
      booksRepository.findById.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar um livro', async () => {
      const updateDto = { title: 'Updated Book' };
      const updatedBook = { ...mockBook, title: 'Updated Book' };
      
      booksRepository.findById.mockResolvedValue(mockBook);
      booksRepository.update.mockResolvedValue(updatedBook);

      const result = await service.update(1, updateDto);

      expect(result.title).toBe('Updated Book');
    });

    it('deve lançar erro quando livro não existe', async () => {
      booksRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Test' }))
        .rejects.toThrow('Livro não encontrado');
    });
  });

  describe('remove', () => {
    it('deve deletar um livro', async () => {
      booksRepository.findById.mockResolvedValue(mockBook);

      await service.remove(1);

      expect(booksRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando livro não existe', async () => {
      booksRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999))
        .rejects.toThrow('Livro com ID 999 não encontrado');
    });
  });

  describe('count', () => {
    it('deve contar livros', async () => {
      booksRepository.count.mockResolvedValue(5);
      const result = await service.count();

      expect(result).toBe(5);
    });
  });

  describe('restore', () => {
    it('deve restaurar um livro deletado', async () => {
      const deletedBook = { ...mockBook, deleted_at: new Date() };
      const restoredBook = { ...mockBook, deleted_at: null };

      booksRepository.findById.mockResolvedValue(deletedBook);
      booksRepository.restore.mockResolvedValue(restoredBook);

      const result = await service.restore(1);

      expect(booksRepository.findById).toHaveBeenCalledWith(1);
      expect(booksRepository.restore).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('deleted_at', null);
    });

    it('deve lançar erro quando livro não existe', async () => {
      booksRepository.findById.mockResolvedValue(null);

      await expect(service.restore(999))
        .rejects.toThrow('Livro com ID 999 não encontrado');
    });
  });
});
