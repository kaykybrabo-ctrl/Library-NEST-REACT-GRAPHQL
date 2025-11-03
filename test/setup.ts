import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};


expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
});

afterEach(() => {
  jest.clearAllMocks();
});

global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 1,
    username: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    user_id: 1,
    display_name: null,
    profile_image: null,
    favorite_book_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
  
  createMockBook: (overrides = {}) => ({
    book_id: 1,
    title: 'Test Book',
    description: 'Test Description',
    photo: null,
    author_id: 1,
    deleted_at: null,
    ...overrides,
  }),
  
  createMockAuthor: (overrides = {}) => ({
    author_id: 1,
    name_author: 'Test Author',
    biography: 'Test Biography',
    photo: null,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
  
  createMockLoan: (overrides = {}) => ({
    loans_id: 1,
    user_id: 1,
    book_id: 1,
    loan_date: new Date(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    returned_at: null,
    is_overdue: false,
    fine_amount: 0,
    ...overrides,
  }),
  
  createMockReview: (overrides = {}) => ({
    id: 1,
    user_id: 1,
    book_id: 1,
    rating: 5,
    comment: 'Great book!',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
    }
  }
  
  var testUtils: {
    createMockUser: (overrides?: any) => any;
    createMockBook: (overrides?: any) => any;
    createMockAuthor: (overrides?: any) => any;
    createMockLoan: (overrides?: any) => any;
    createMockReview: (overrides?: any) => any;
  };
}
