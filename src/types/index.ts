export interface Book {
  book_id: number;
  title: string;
  description?: string;
  author_id: number;
  author_name?: string;
  photo?: string;
  deleted_at?: string | null;
  categories?: string[];
  publishers?: string[];
}

export interface Author {
  author_id: number;
  name_author: string;
  photo?: string;
  biography?: string;
  deleted_at?: string | null;
}

export interface User {
  id: number;
  username: string;
  role: string;
  profile_image?: string;
  description?: string;
  display_name?: string;
}

export interface Loan {
  loans_id: number;
  loan_date: string;
  book_id: number;
  title: string;
  photo?: string;
  description?: string;
}

export interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
  };
}
