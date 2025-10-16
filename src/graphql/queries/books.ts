import { gql } from '@apollo/client';

export const GET_BOOKS = gql`
  query GetBooks($page: Int, $limit: Int, $search: String, $includeDeleted: Boolean) {
    books(page: $page, limit: $limit, search: $search, includeDeleted: $includeDeleted) {
      book_id
      title
      description
      photo
      author_id
      deleted_at
      author {
        author_id
        name_author
        biography
      }
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook($id: Int!) {
    book(id: $id) {
      book_id
      title
      description
      photo
      author_id
      deleted_at
      author {
        author_id
        name_author
        biography
        photo
        deleted_at
      }
    }
  }
`;

export const GET_BOOKS_COUNT = gql`
  query GetBooksCount {
    booksCount
  }
`;

export const CREATE_BOOK = gql`
  mutation CreateBook($createBookInput: CreateBookDto!) {
    createBook(createBookInput: $createBookInput) {
      book_id
      title
      description
      photo
      author_id
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: Int!, $updateBookInput: UpdateBookDto!) {
    updateBook(id: $id, updateBookInput: $updateBookInput) {
      book_id
      title
      description
      photo
      author_id
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation RemoveBook($id: Int!) {
    removeBook(id: $id)
  }
`;

export const RESTORE_BOOK = gql`
  mutation RestoreBook($id: Int!) {
    restoreBook(id: $id)
  }
`;

export const UPLOAD_BOOK_IMAGE = gql`
  mutation UploadBookImage($bookId: Int!, $filename: String!, $fileData: String!) {
    uploadBookImage(bookId: $bookId, filename: $filename, fileData: $fileData) {
      book_id
      title
      description
      photo
      deleted_at
      author_id
      author {
        author_id
        name_author
        biography
        photo
        deleted_at
      }
    }
  }
`;
