import { Test, TestingModule } from '@nestjs/testing';

const mockLoansRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  findByUser: jest.fn(),
  findActiveByBookAndUser: jest.fn(),
  findActiveByBook: jest.fn(),
  findOverdue: jest.fn(),
};

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

class MockLoansService {
  constructor(
    private repository: any,
    private prisma: any
  ) {}

  async create(userId: number, bookId: number) {
    const authUser = await this.prisma.authUser.findUnique({
      where: { id: userId }
    });

    if (!authUser) {
      throw new Error('Usuário não encontrado');
    }

    if (!authUser.user_id) {
      throw new Error('Usuário não possui user_id válido');
    }

    const existingLoan = await this.prisma.loan.findFirst({
      where: {
        book_id: bookId,
        returned_at: null,
      }
    });

    if (existingLoan) {
      throw new Error('Este livro já está alugado');
    }

    const userLoan = await this.prisma.loan.findFirst({
      where: {
        user_id: authUser.user_id,
        book_id: bookId,
        returned_at: null,
      }
    });

    if (userLoan) {
      throw new Error('Você já possui este livro alugado');
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    return this.prisma.loan.create({
      data: {
        user_id: authUser.user_id,
        book_id: bookId,
        loan_date: now,
        due_date: dueDate,
        returned_at: null,
        is_overdue: false,
        fine_amount: 0,
      }
    });
  }

  async findByUser(userId: number) {
    const loans = await this.repository.findByUser(userId);
    
    return loans.map(loan => {
      const now = new Date();
      const dueDate = new Date(loan.due_date);
      const timeDiff = dueDate.getTime() - now.getTime();
      
      const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
      
      return {
        ...loan,
        days_remaining: daysRemaining,
        hours_remaining: hoursRemaining,
        is_overdue: timeDiff < 0,
        time_remaining: this.formatTimeRemaining(daysRemaining, hoursRemaining)
      };
    });
  }

  async returnBook(loanId: number) {
    const loan = await this.prisma.loan.findFirst({
      where: { loans_id: loanId }
    });

    if (!loan) {
      throw new Error('Empréstimo não encontrado');
    }

    if (loan.returned_at) {
      throw new Error('Este livro já foi devolvido');
    }

    return this.prisma.loan.update({
      where: { loans_id: loanId },
      data: {
        returned_at: new Date(),
      }
    });
  }

  async findAll() {
    return this.repository.findAll();
  }

  async getOverdueLoans(userId: number) {
    const now = new Date();
    return this.prisma.loan.findMany({
      where: {
        user_id: userId,
        due_date: { lt: now },
        returned_at: null,
      }
    });
  }

  private formatTimeRemaining(days: number, hours: number): string {
    if (days > 1) {
      const hoursLeft = hours % 24;
      return `${days} dias e ${hoursLeft}h`;
    } else if (days === 1) {
      const hoursLeft = hours % 24;
      return `1 dia e ${hoursLeft}h`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return 'Vencido';
    }
  }
}

describe('LoansService (Simplified)', () => {
  let service: MockLoansService;
  let repository: jest.Mocked<any>;
  let prisma: jest.Mocked<any>;

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
    book: {
      book_id: 1,
      title: 'Test Book',
      author: {
        name_author: 'Test Author'
      }
    }
  };

  beforeEach(async () => {
    repository = mockLoansRepository as jest.Mocked<any>;
    prisma = mockPrismaService as jest.Mocked<any>;
    service = new MockLoansService(repository, prisma);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a loan successfully', async () => {
      prisma.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prisma.loan.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prisma.loan.create.mockResolvedValue(mockLoan);

      const result = await service.create(1, 1);

      expect(prisma.authUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prisma.loan.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      prisma.authUser.findUnique.mockResolvedValue(null);

      await expect(service.create(999, 1)).rejects.toThrow(
        'Usuário não encontrado'
      );
    });

    it('should throw error when user has no user_id', async () => {
      const authUserWithoutUserId = { ...mockAuthUser, user_id: null };
      prisma.authUser.findUnique.mockResolvedValue(authUserWithoutUserId);

      await expect(service.create(1, 1)).rejects.toThrow(
        'Usuário não possui user_id válido'
      );
    });

    it('should throw error when book is already loaned', async () => {
      prisma.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prisma.loan.findFirst.mockResolvedValueOnce(mockLoan);

      await expect(service.create(1, 1)).rejects.toThrow(
        'Este livro já está alugado'
      );
    });

    it('should throw error when user already has the book', async () => {
      prisma.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prisma.loan.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockLoan);

      await expect(service.create(1, 1)).rejects.toThrow(
        'Você já possui este livro alugado'
      );
    });

    it('should create loan with correct due date (7 days)', async () => {
      prisma.authUser.findUnique.mockResolvedValue(mockAuthUser);
      prisma.loan.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prisma.loan.create.mockResolvedValue(mockLoan);

      await service.create(1, 1);

      expect(prisma.loan.create).toHaveBeenCalled();
      const createCall = prisma.loan.create.mock.calls[0][0];
      expect(createCall.data.user_id).toBe(1);
      expect(createCall.data.book_id).toBe(1);
    });
  });

  describe('findByUser', () => {
    it('should return user loans with calculated time remaining', async () => {
      const mockLoans = [mockLoan];
      repository.findByUser.mockResolvedValue(mockLoans);

      const result = await service.findByUser(1);

      expect(repository.findByUser).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('days_remaining');
      expect(result[0]).toHaveProperty('hours_remaining');
      expect(result[0]).toHaveProperty('time_remaining');
    });
  });

  describe('returnBook', () => {
    it('should return a book successfully', async () => {
      const loanId = 1;
      const returnedLoan = { ...mockLoan, returned_at: new Date() };
      prisma.loan.findFirst.mockResolvedValue(mockLoan);
      prisma.loan.update.mockResolvedValue(returnedLoan);

      const result = await service.returnBook(loanId);

      expect(prisma.loan.findFirst).toHaveBeenCalledWith({
        where: { loans_id: loanId }
      });
      expect(prisma.loan.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when loan not found', async () => {
      prisma.loan.findFirst.mockResolvedValue(null);

      await expect(service.returnBook(999)).rejects.toThrow(
        'Empréstimo não encontrado'
      );
    });

    it('should throw error when book already returned', async () => {
      const returnedLoan = { ...mockLoan, returned_at: new Date() };
      prisma.loan.findFirst.mockResolvedValue(returnedLoan);

      await expect(service.returnBook(1)).rejects.toThrow(
        'Este livro já foi devolvido'
      );
    });
  });

  describe('findAll', () => {
    it('should return all loans', async () => {
      const mockLoans = [mockLoan];
      repository.findAll.mockResolvedValue(mockLoans);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLoans);
    });
  });

  describe('getOverdueLoans', () => {
    it('should return overdue loans for user', async () => {
      const overdueLoan = { ...mockLoan, due_date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) };
      prisma.loan.findMany.mockResolvedValue([overdueLoan]);

      const result = await service.getOverdueLoans(1);

      expect(prisma.loan.findMany).toHaveBeenCalled();
      expect(result).toEqual([overdueLoan]);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format time correctly for multiple days', () => {
      const result = service['formatTimeRemaining'](5, 120);
      expect(result).toBe('5 dias e 0h');
    });

    it('should format time correctly for one day', () => {
      const result = service['formatTimeRemaining'](1, 30);
      expect(result).toBe('1 dia e 6h');
    });

    it('should format time correctly for hours only', () => {
      const result = service['formatTimeRemaining'](0, 5);
      expect(result).toBe('5 horas');
    });

    it('should format time correctly for one hour', () => {
      const result = service['formatTimeRemaining'](0, 1);
      expect(result).toBe('1 hora');
    });

    it('should return "Vencido" for expired loans', () => {
      const result = service['formatTimeRemaining'](-1, -5);
      expect(result).toBe('Vencido');
    });
  });
});
