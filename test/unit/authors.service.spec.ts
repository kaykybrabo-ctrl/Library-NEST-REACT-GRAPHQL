import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from '../../src/modules/authors/authors.service';
import { AuthorsRepository } from '../../src/modules/authors/authors.repository';
import { CloudinaryService } from '../../src/common/services/cloudinary.service';

describe('AuthorsService - Testes Unitários', () => {
  let service: AuthorsService;
  let authorsRepository: jest.Mocked<AuthorsRepository>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  const mockAuthor = {
    author_id: 1,
    name_author: 'Test Author',
    biography: 'Test Biography',
    photo: null,
    deleted_at: null,
  };

  beforeEach(async () => {
    const mockAuthorsRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      count: jest.fn(),
      updatePhoto: jest.fn(),
    };

    const mockCloudinaryService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: AuthorsRepository, useValue: mockAuthorsRepository },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    authorsRepository = module.get(AuthorsRepository);
    cloudinaryService = module.get(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um autor com sucesso', async () => {
      const createAuthorDto = {
        name_author: 'New Author',
        biography: 'New Biography',
      };

      authorsRepository.create.mockResolvedValue(mockAuthor);

      const result = await service.create(createAuthorDto);

      expect(authorsRepository.create).toHaveBeenCalledWith(createAuthorDto);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('findAll', () => {
    it('deve retornar autores sem paginação', async () => {
      const mockAuthors = [mockAuthor];
      authorsRepository.findAll.mockResolvedValue(mockAuthors);

      const result = await service.findAll();

      expect(authorsRepository.findAll).toHaveBeenCalledWith({
        where: { deleted_at: null },
        orderBy: { author_id: 'asc' },
      });
      expect(result.authors).toEqual(mockAuthors);
    });

    it('deve retornar autores com paginação', async () => {
      const mockAuthors = [mockAuthor];
      authorsRepository.findAll.mockResolvedValue(mockAuthors);
      authorsRepository.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.authors).toEqual(mockAuthors);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('deve encontrar um autor por ID', async () => {
      authorsRepository.findById.mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);

      expect(authorsRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAuthor);
    });

    it('deve retornar null quando autor não existe', async () => {
      authorsRepository.findById.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('deve encontrar autor por nome', async () => {
      authorsRepository.findByName.mockResolvedValue(mockAuthor);

      const result = await service.findByName('Test Author');

      expect(authorsRepository.findByName).toHaveBeenCalledWith('Test Author');
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('update', () => {
    it('deve atualizar um autor', async () => {
      const updateDto = { name_author: 'Updated Author' };
      const updatedAuthor = { ...mockAuthor, name_author: 'Updated Author' };
      
      authorsRepository.findById.mockResolvedValue(mockAuthor);
      authorsRepository.update.mockResolvedValue(updatedAuthor);

      const result = await service.update(1, updateDto);

      expect(result.name_author).toBe('Updated Author');
    });

    it('deve lançar erro quando autor não existe', async () => {
      authorsRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { name_author: 'Test' }))
        .rejects.toThrow('Autor não encontrado');
    });
  });

  describe('remove', () => {
    it('deve deletar um autor', async () => {
      const deletedAuthor = { ...mockAuthor, deleted_at: new Date() };
      authorsRepository.findById.mockResolvedValue(mockAuthor);
      authorsRepository.softDelete.mockResolvedValue(deletedAuthor);

      const result = await service.remove(1);

      expect(authorsRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('deleted_at');
    });
  });

  describe('count', () => {
    it('deve contar autores', async () => {
      authorsRepository.count.mockResolvedValue(3);

      const result = await service.count();

      expect(result).toBe(3);
    });
  });

});
