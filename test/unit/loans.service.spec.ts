import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LoansService } from '../../src/modules/loans/loans.service';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';

describe('LoansService - Testes Unitários', () => {
  let service: LoansService;
  let prismaService: any;

  const mockAuthUser = {
    id: 1,
    user_id: 1,
    username: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
  };

  const mockLoan = {
    loans_id: 1,
    user_id: 1,
    book_id: 1,
    loan_date: new Date(),
    due_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    returned_at: null,
    is_overdue: false,
    fine_amount: 0,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      authUser: {
        findUnique: jest.fn(),
      },
      loan: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um empréstimo com sucesso', async () => {
      const createLoanDto = { user_id: 1, book_id: 1 };

      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findFirst
        .mockResolvedValueOnce(null) // Livro não está emprestado
        .mockResolvedValueOnce(null); // Usuário não tem o livro
      prismaService.loan.create.mockResolvedValue(mockLoan);

      const result = await service.create(createLoanDto);

      expect(prismaService.authUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prismaService.loan.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('deve lançar erro quando usuário não existe', async () => {
      const createLoanDto = { user_id: 999, book_id: 1 };
      
      prismaService.authUser.findUnique.mockResolvedValue(null);

      await expect(service.create(createLoanDto))
        .rejects.toThrow(ConflictException);
    });

    it('deve lançar erro quando livro já está emprestado', async () => {
      const createLoanDto = { user_id: 1, book_id: 1 };
      
      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findFirst.mockResolvedValueOnce(mockLoan); // Livro já emprestado

      await expect(service.create(createLoanDto))
        .rejects.toThrow(ConflictException);
    });

    it('deve lançar erro quando usuário já possui o livro', async () => {
      const createLoanDto = { user_id: 1, book_id: 1 };
      
      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findFirst
        .mockResolvedValueOnce(null) // Livro não está emprestado para outros
        .mockResolvedValueOnce(mockLoan); // Mas usuário já tem o livro

      await expect(service.create(createLoanDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findByUser', () => {
    it('deve retornar empréstimos do usuário', async () => {
      const mockLoans = [mockLoan];
      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findMany.mockResolvedValue(mockLoans);

      const result = await service.findByUser(1);

      expect(prismaService.authUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prismaService.loan.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os empréstimos', async () => {
      const mockLoans = [mockLoan];
      const mockQueryResult = [{ display_name: 'Test User', username: 'test@example.com' }];
      
      prismaService.loan.findMany.mockResolvedValue(mockLoans);
      prismaService.$queryRaw = jest.fn().mockResolvedValue(mockQueryResult);

      const result = await service.findAll();

      expect(prismaService.loan.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('loans_id', 1);
    });
  });

});
