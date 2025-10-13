export interface BookInterface {
  book_id: number;
  title: string;
  description?: string;
  author_id: number;
  author_name?: string;
  photo?: string;
  deleted_at?: Date | null;
  categories?: string[];
  publishers?: string[];
}

export interface CreateBookInterface {
  title: string;
  author_id: number;
}

export interface UpdateBookInterface {
  title?: string;
  author_id?: number;
}
