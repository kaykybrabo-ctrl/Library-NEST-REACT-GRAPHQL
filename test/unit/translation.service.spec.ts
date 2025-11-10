import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from '../../src/modules/loans/loans.service';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';

describe('Translation and Text Formatting - Testes Unitários', () => {
  let loansService: LoansService;
  let prismaService: any;

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
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    loansService = module.get<LoansService>(LoansService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('formatTimeRemaining - Tradução de Tempo', () => {
    it('deve retornar texto em português para múltiplos dias', () => {
      const result = (loansService as any).formatTimeRemaining(5, 140);
      expect(result).toBe('5 dias e 20h');
      expect(result).not.toContain('days');
      expect(result).not.toContain('hours');
    });

    it('deve retornar texto em português para 1 dia', () => {
      const result = (loansService as any).formatTimeRemaining(1, 30);
      expect(result).toBe('1 dia e 6h');
      expect(result).not.toContain('day');
      expect(result).not.toContain('hour');
    });

    it('deve retornar "horas" no plural em português', () => {
      const result = (loansService as any).formatTimeRemaining(0, 15);
      expect(result).toBe('15 horas');
      expect(result).not.toContain('hours');
    });

    it('deve retornar "hora" no singular em português', () => {
      const result = (loansService as any).formatTimeRemaining(0, 1);
      expect(result).toBe('1 hora');
      expect(result).not.toContain('hour');
    });

    it('deve retornar "Menos de 1 hora" em português', () => {
      const result = (loansService as any).formatTimeRemaining(0, 0);
      expect(result).toBe('Menos de 1 hora');
      expect(result).not.toContain('Less than');
    });

    it('deve usar "e" em vez de "and" para conectar dias e horas', () => {
      const result = (loansService as any).formatTimeRemaining(3, 78);
      expect(result).toContain(' e ');
      expect(result).not.toContain(' and ');
    });
  });

  describe('Fallbacks de Usuário - Tradução', () => {
    it('deve usar "Usuário" como fallback em findByUser', async () => {
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
        book: { title: 'Test Book' }
      };

      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findMany.mockResolvedValue([mockLoan]);

      const result = await loansService.findByUser(1);

      const resultString = JSON.stringify(result);
      expect(resultString).not.toContain('User');
      expect(resultString).not.toContain('Overdue');
      expect(resultString).not.toContain('days and');
    });

    it('deve usar "Vencido" em vez de "Overdue" para empréstimos atrasados', async () => {
      const mockAuthUser = {
        id: 1,
        user_id: 1,
        username: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      };

      const overdueLoan = {
        loans_id: 1,
        user_id: 1,
        book_id: 1,
        loan_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        returned_at: null,
        is_overdue: true,
        fine_amount: 5.0,
        book: { title: 'Overdue Book' }
      };

      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findMany.mockResolvedValue([overdueLoan]);

      const result = await loansService.findByUser(1);

      expect(result[0]).toHaveProperty('time_remaining', 'Vencido');
      expect(result[0].time_remaining).not.toBe('Overdue');
    });

    it('deve usar "Título não encontrado" como fallback', async () => {
      const mockLoan = {
        loans_id: 1,
        user_id: 1,
        book_id: 1,
        loan_date: new Date(),
        due_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        returned_at: null,
        is_overdue: false,
        fine_amount: 0,
        book: null
      };

      prismaService.authUser.findUnique.mockResolvedValue({
        id: 1,
        user_id: 1,
        username: 'test@example.com',
      });
      prismaService.loan.findMany.mockResolvedValue([mockLoan]);

      const result = await loansService.findByUser(1);

      expect(result[0]).toHaveProperty('title', 'Título não encontrado');
      expect(result[0].title).not.toBe('Title not found');
    });
  });

  describe('Consistência de Idioma', () => {
    it('deve manter todos os textos visíveis em português', async () => {
      const mockAuthUser = {
        id: 1,
        user_id: 1,
        username: 'test@example.com',
      };

      const mockLoan = {
        loans_id: 1,
        user_id: 1,
        book_id: 1,
        loan_date: new Date(),
        due_date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        returned_at: null,
        is_overdue: false,
        fine_amount: 0,
        book: { title: 'Test Book' }
      };

      prismaService.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prismaService.loan.findMany.mockResolvedValue([mockLoan]);

      const result = await loansService.findByUser(1);

      const englishWords = [
        'User', 'Admin',
        'Overdue',
        'days and', 'day and',
        'Less than',
        'Title not found',
        'Address not provided'
      ];

      const resultString = JSON.stringify(result);
      
      englishWords.forEach(word => {
        expect(resultString).not.toContain(word);
      });

      const portugueseWords = ['dias', 'hora', 'Vencido'];
      const hasPortuguese = portugueseWords.some(word => resultString.includes(word));
      
      if (result[0]?.time_remaining && result[0].time_remaining !== 'Vencido') {
        expect(hasPortuguese).toBe(true);
      }
    });
  });
});
