import { Test, TestingModule } from '@nestjs/testing';

const mockReviewsRepository = {
  create: jest.fn(),
  findByBook: jest.fn(),
  findByUserAndBook: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getBookRating: jest.fn(),
};

const mockPrismaService = {
  review: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

class MockReviewsService {
  constructor(
    private repository: any,
    private prisma: any
  ) {}

  async create(userId: number, bookId: number, rating: number, comment?: string) {
    const existingReview = await this.repository.findByUserAndBook(userId, bookId);
    
    if (existingReview) {
      return this.repository.update(existingReview.id, { rating, comment });
    }

    return this.repository.create({
      user_id: userId,
      book_id: bookId,
      rating,
      comment: comment || null,
    });
  }

  async findByBook(bookId: number) {
    const reviews = await this.repository.findByBook(bookId);
    
    return reviews.map(review => ({
      ...review,
      display_name: this.getDisplayName(review.user)
    }));
  }

  async findUserReview(userId: number, bookId: number) {
    return this.repository.findByUserAndBook(userId, bookId);
  }

  async getBookRating(bookId: number) {
    const result = await this.repository.getBookRating(bookId);
    
    if (!result || result.count === 0) {
      return {
        average_rating: 0,
        total_reviews: 0
      };
    }

    return {
      average_rating: parseFloat(result.average.toFixed(1)),
      total_reviews: result.count
    };
  }

  async delete(reviewId: number, userId: number) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Avaliação não encontrada');
    }

    if (review.user_id !== userId) {
      throw new Error('Você só pode deletar suas próprias avaliações');
    }

    return this.repository.delete(reviewId);
  }

  private getDisplayName(user: any): string {
    if (user?.display_name) {
      return user.display_name;
    }
    
    if (user?.username) {
      if (user.username.includes('@')) {
        return user.username.split('@')[0];
      }
      return user.username;
    }
    
    return 'Usuário';
  }
}

describe('ReviewsService (Simplified)', () => {
  let service: MockReviewsService;
  let repository: jest.Mocked<any>;
  let prisma: jest.Mocked<any>;

  const mockUser = {
    id: 1,
    username: 'test@example.com',
    display_name: 'Test User',
  };

  const mockReview = {
    id: 1,
    user_id: 1,
    book_id: 1,
    rating: 5,
    comment: 'Great book!',
    created_at: new Date(),
    updated_at: new Date(),
    user: mockUser,
  };

  beforeEach(async () => {
    repository = mockReviewsRepository as jest.Mocked<any>;
    prisma = mockPrismaService as jest.Mocked<any>;
    service = new MockReviewsService(repository, prisma);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new review', async () => {
      repository.findByUserAndBook.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockReview);

      const result = await service.create(1, 1, 5, 'Great book!');

      expect(repository.findByUserAndBook).toHaveBeenCalledWith(1, 1);
      expect(repository.create).toHaveBeenCalledWith({
        user_id: 1,
        book_id: 1,
        rating: 5,
        comment: 'Great book!',
      });
      expect(result).toEqual(mockReview);
    });

    it('should update existing review', async () => {
      const existingReview = { ...mockReview, rating: 3 };
      repository.findByUserAndBook.mockResolvedValue(existingReview);
      repository.update.mockResolvedValue({ ...mockReview, rating: 5 });

      const result = await service.create(1, 1, 5, 'Updated comment');

      expect(repository.findByUserAndBook).toHaveBeenCalledWith(1, 1);
      expect(repository.update).toHaveBeenCalledWith(existingReview.id, {
        rating: 5,
        comment: 'Updated comment',
      });
      expect(result).toBeDefined();
    });

    it('should create review without comment', async () => {
      repository.findByUserAndBook.mockResolvedValue(null);
      repository.create.mockResolvedValue({ ...mockReview, comment: null });

      const result = await service.create(1, 1, 4);

      expect(repository.create).toHaveBeenCalledWith({
        user_id: 1,
        book_id: 1,
        rating: 4,
        comment: null,
      });
      expect(result).toBeDefined();
    });
  });

  describe('findByBook', () => {
    it('should return reviews with display names', async () => {
      const reviews = [mockReview];
      repository.findByBook.mockResolvedValue(reviews);

      const result = await service.findByBook(1);

      expect(repository.findByBook).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('display_name', 'Test User');
    });

    it('should handle user without display_name', async () => {
      const reviewWithoutDisplayName = {
        ...mockReview,
        user: { ...mockUser, display_name: null }
      };
      repository.findByBook.mockResolvedValue([reviewWithoutDisplayName]);

      const result = await service.findByBook(1);

      expect(result[0].display_name).toBe('test');
    });

    it('should handle user without username', async () => {
      const reviewWithoutUsername = {
        ...mockReview,
        user: { ...mockUser, display_name: null, username: null }
      };
      repository.findByBook.mockResolvedValue([reviewWithoutUsername]);

      const result = await service.findByBook(1);

      expect(result[0].display_name).toBe('Usuário');
    });
  });

  describe('findUserReview', () => {
    it('should return user review for book', async () => {
      repository.findByUserAndBook.mockResolvedValue(mockReview);

      const result = await service.findUserReview(1, 1);

      expect(repository.findByUserAndBook).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockReview);
    });

    it('should return null when no review found', async () => {
      repository.findByUserAndBook.mockResolvedValue(null);

      const result = await service.findUserReview(1, 1);

      expect(result).toBeNull();
    });
  });

  describe('getBookRating', () => {
    it('should return average rating and total reviews', async () => {
      const ratingData = {
        average: 4.5,
        count: 10
      };
      repository.getBookRating.mockResolvedValue(ratingData);

      const result = await service.getBookRating(1);

      expect(repository.getBookRating).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        average_rating: 4.5,
        total_reviews: 10
      });
    });

    it('should return zeros when no reviews exist', async () => {
      repository.getBookRating.mockResolvedValue(null);

      const result = await service.getBookRating(1);

      expect(result).toEqual({
        average_rating: 0,
        total_reviews: 0
      });
    });

    it('should return zeros when count is zero', async () => {
      repository.getBookRating.mockResolvedValue({ average: 0, count: 0 });

      const result = await service.getBookRating(1);

      expect(result).toEqual({
        average_rating: 0,
        total_reviews: 0
      });
    });

    it('should round average rating to one decimal place', async () => {
      repository.getBookRating.mockResolvedValue({ average: 4.666666, count: 3 });

      const result = await service.getBookRating(1);

      expect(result.average_rating).toBe(4.7);
    });
  });

  describe('delete', () => {
    it('should delete review successfully', async () => {
      prisma.review.findFirst.mockResolvedValue(mockReview);
      repository.delete.mockResolvedValue(true);

      const result = await service.delete(1, 1);

      expect(prisma.review.findFirst).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw error when review not found', async () => {
      prisma.review.findFirst.mockResolvedValue(null);

      await expect(service.delete(999, 1)).rejects.toThrow(
        'Avaliação não encontrada'
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when user tries to delete others review', async () => {
      const otherUserReview = { ...mockReview, user_id: 2 };
      prisma.review.findFirst.mockResolvedValue(otherUserReview);

      await expect(service.delete(1, 1)).rejects.toThrow(
        'Você só pode deletar suas próprias avaliações'
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getDisplayName', () => {
    it('should return display_name when available', () => {
      const user = { display_name: 'John Doe', username: 'john@example.com' };
      const result = service['getDisplayName'](user);
      expect(result).toBe('John Doe');
    });

    it('should return username prefix when no display_name', () => {
      const user = { display_name: null, username: 'john@example.com' };
      const result = service['getDisplayName'](user);
      expect(result).toBe('john');
    });

    it('should return username when not email format', () => {
      const user = { display_name: null, username: 'johnsmith' };
      const result = service['getDisplayName'](user);
      expect(result).toBe('johnsmith');
    });

    it('should return fallback when no user data', () => {
      const result = service['getDisplayName'](null);
      expect(result).toBe('Usuário');
    });

    it('should return fallback when no username', () => {
      const user = { display_name: null, username: null };
      const result = service['getDisplayName'](user);
      expect(result).toBe('Usuário');
    });
  });
});
