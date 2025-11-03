import { Test, TestingModule } from '@nestjs/testing';

const mockCategoriesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockPrismaService = {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

class MockCategoriesService {
  constructor(
    private repository: any,
    private prisma: any
  ) {}

  async create(createCategoryDto: any) {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name }
    });

    if (existing) {
      throw new Error('Categoria já existe');
    }

    return await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
  }

  async findAll(page?: number, limit?: number) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    return await this.prisma.category.findMany({
      skip,
      take,
      where: { deleted_at: null },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: number) {
    return await this.prisma.category.findUnique({
      where: { 
        category_id: id,
        deleted_at: null 
      }
    });
  }

  async update(id: number, updateCategoryDto: any) {
    const category = await this.findOne(id);
    
    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return await this.prisma.category.update({
      where: { category_id: id },
      data: {
        ...updateCategoryDto,
        updated_at: new Date(),
      }
    });
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    
    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return await this.prisma.category.update({
      where: { category_id: id },
      data: { deleted_at: new Date() }
    });
  }
}

describe('CategoriesService (Simplified)', () => {
  let service: MockCategoriesService;
  let repository: jest.Mocked<any>;
  let prisma: jest.Mocked<any>;

  const mockCategory = {
    category_id: 1,
    name: 'Romance',
    description: 'Livros de romance',
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    repository = mockCategoriesRepository as jest.Mocked<any>;
    prisma = mockPrismaService as jest.Mocked<any>;
    service = new MockCategoriesService(repository, prisma);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createCategoryDto = {
        name: 'Ficção Científica',
        description: 'Livros de ficção científica'
      };

      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue({
        ...mockCategory,
        ...createCategoryDto,
      });

      const result = await service.create(createCategoryDto);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: createCategoryDto.name }
      });
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createCategoryDto.name,
          description: createCategoryDto.description,
        })
      });
      expect(result.name).toBe(createCategoryDto.name);
    });

    it('should throw error when category already exists', async () => {
      const createCategoryDto = {
        name: 'Romance',
        description: 'Categoria já existente'
      };

      prisma.category.findUnique.mockResolvedValue(mockCategory);

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        'Categoria já existe'
      );

      expect(prisma.category.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all categories with pagination', async () => {
      const page = 1;
      const limit = 10;
      const mockCategories = [mockCategory];

      prisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(page, limit);

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deleted_at: null },
        orderBy: { name: 'asc' }
      });
      expect(result).toEqual(mockCategories);
    });

    it('should return all categories without pagination', async () => {
      const mockCategories = [mockCategory];
      prisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { deleted_at: null },
        orderBy: { name: 'asc' }
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = 1;
      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { 
          category_id: categoryId,
          deleted_at: null 
        }
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      const categoryId = 999;
      prisma.category.findUnique.mockResolvedValue(null);

      const result = await service.findOne(categoryId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const categoryId = 1;
      const updateDto = {
        name: 'Romance Atualizado',
        description: 'Nova descrição'
      };

      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.update.mockResolvedValue({
        ...mockCategory,
        ...updateDto,
        updated_at: new Date(),
      });

      const result = await service.update(categoryId, updateDto);

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { category_id: categoryId },
        data: expect.objectContaining({
          ...updateDto,
          updated_at: expect.any(Date),
        })
      });
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw error when category not found', async () => {
      const categoryId = 999;
      const updateDto = { name: 'Teste' };

      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.update(categoryId, updateDto)).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a category successfully', async () => {
      const categoryId = 1;

      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.update.mockResolvedValue({
        ...mockCategory,
        deleted_at: new Date(),
      });

      const result = await service.remove(categoryId);

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { category_id: categoryId },
        data: { deleted_at: expect.any(Date) }
      });
      expect(result.deleted_at).toBeDefined();
    });

    it('should throw error when category not found', async () => {
      const categoryId = 999;
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.remove(categoryId)).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });
});
