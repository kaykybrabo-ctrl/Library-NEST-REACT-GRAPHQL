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
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
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
      prismaService.loan.findFirst.mockResolvedValueOnce(mockLoan);

      await expect(service.create(createLoanDto))
        .rejects.toThrow(ConflictException);
    });

    it('deve lançar erro quando usuário já possui o livro', async () => {
      const createLoanDto = { user_id: 1, book_id: 1 };
      
      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockLoan);

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

  describe('formatTimeRemaining', () => {
    it('deve formatar tempo com múltiplos dias e horas', () => {
      const result = (service as any).formatTimeRemaining(5, 140);
      expect(result).toBe('5 dias e 20h');
    });

    it('deve formatar tempo com 1 dia e horas', () => {
      const result = (service as any).formatTimeRemaining(1, 30);
      expect(result).toBe('1 dia e 6h');
    });

    it('deve formatar tempo apenas com horas (múltiplas)', () => {
      const result = (service as any).formatTimeRemaining(0, 15);
      expect(result).toBe('15 horas');
    });

    it('deve formatar tempo apenas com 1 hora', () => {
      const result = (service as any).formatTimeRemaining(0, 1);
      expect(result).toBe('1 hora');
    });

    it('deve retornar "Menos de 1 hora" para tempo muito baixo', () => {
      const result = (service as any).formatTimeRemaining(0, 0);
      expect(result).toBe('Menos de 1 hora');
    });

    it('deve converter horas extras em dias corretamente', () => {
      const result = (service as any).formatTimeRemaining(2, 72);
      expect(result).toBe('3 dias e 0h');
    });
  });

  describe('remove', () => {
    it('deve remover empréstimo (devolver livro)', async () => {
      const mockReturnedLoan = { ...mockLoan, returned_at: new Date() };

      prismaService.loan.update.mockResolvedValue(mockReturnedLoan);

      await service.remove(1);

      expect(prismaService.loan.update).toHaveBeenCalledWith({
        where: { loans_id: 1 },
        data: { returned_at: expect.any(Date) },
      });
    });
  });

  describe('getOverdueLoans', () => {
    it('deve retornar empréstimos vencidos do usuário', async () => {
      const overdueDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const mockOverdueLoan = {
        ...mockLoan,
        due_date: overdueDate,
        book: { title: 'Livro Vencido' }
      };

      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findMany.mockResolvedValue([mockOverdueLoan]);

      const result = await service.getOverdueLoans(1);

      expect(prismaService.authUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prismaService.loan.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 1,
          returned_at: null,
          due_date: {
            lt: expect.any(Date),
          },
        },
        include: {
          book: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('book_title', 'Livro Vencido');
    });

    it('deve retornar array vazio quando usuário não tem empréstimos vencidos', async () => {
      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findMany.mockResolvedValue([]);

      const result = await service.getOverdueLoans(1);

      expect(result).toEqual([]);
    });
  });

  describe('findUserLoan', () => {
    it('deve encontrar empréstimo específico do usuário', async () => {
      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findFirst.mockResolvedValue(mockLoan);

      const result = await service.findUserLoan(1, 1);

      expect(prismaService.authUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prismaService.loan.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 1,
          book_id: 1,
          returned_at: null,
        },
        include: {
          book: true,
        },
      });
      expect(result).toBeDefined();
    });

    it('deve retornar null quando usuário não tem o livro emprestado', async () => {
      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findFirst.mockResolvedValue(null);

      const result = await service.findUserLoan(1, 999);

      expect(result).toBeNull();
    });
  });

});
