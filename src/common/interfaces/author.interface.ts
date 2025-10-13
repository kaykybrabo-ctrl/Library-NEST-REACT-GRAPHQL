export interface AuthorInterface {
  author_id: number;
  name_author: string;
  photo?: string;
  biography?: string;
  deleted_at?: Date | null;
}

export interface CreateAuthorInterface {
  name_author: string;
  biography?: string;
}

export interface UpdateAuthorInterface {
  name_author?: string;
  biography?: string;
}
