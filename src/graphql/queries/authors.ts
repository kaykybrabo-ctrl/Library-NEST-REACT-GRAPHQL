import { gql } from '@apollo/client';

export const GET_AUTHORS = gql`
  query GetAuthors($page: Int, $limit: Int, $includeDeleted: Boolean) {
    authors(page: $page, limit: $limit, includeDeleted: $includeDeleted) {
      author_id
      name_author
      biography
      photo
      deleted_at
    }
  }
`;

export const GET_AUTHOR = gql`
  query GetAuthor($id: Int!) {
    author(id: $id) {
      author_id
      name_author
      biography
      photo
      deleted_at
      books {
        book_id
        title
        description
        photo
      }
    }
  }
`;

export const GET_AUTHORS_COUNT = gql`
  query GetAuthorsCount {
    authorsCount
  }
`;

export const CREATE_AUTHOR = gql`
  mutation CreateAuthor($createAuthorInput: CreateAuthorDto!) {
    createAuthor(createAuthorInput: $createAuthorInput) {
      author_id
      name_author
      biography
      photo
    }
  }
`;

export const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($id: Int!, $updateAuthorInput: UpdateAuthorDto!) {
    updateAuthor(id: $id, updateAuthorInput: $updateAuthorInput) {
      author_id
      name_author
      biography
      photo
    }
  }
`;

export const REMOVE_AUTHOR = gql`
  mutation RemoveAuthor($id: Int!) {
    removeAuthor(id: $id)
  }
`;

export const RESTORE_AUTHOR = gql`
  mutation RestoreAuthor($id: Int!) {
    restoreAuthor(id: $id)
  }
`;
