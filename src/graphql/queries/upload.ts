import { gql } from '@apollo/client';

export const UPLOAD_BOOK_IMAGE_MUTATION = gql`
  mutation UploadBookImage($bookId: Int!, $filename: String!, $fileData: String!) {
    uploadBookImage(bookId: $bookId, filename: $filename, fileData: $fileData) {
      book_id
      title
      description
      photo
      author_id
      author {
        author_id
        name_author
        biography
        photo
      }
    }
  }
`;

export const UPLOAD_USER_IMAGE_MUTATION = gql`
  mutation UploadUserImage($username: String!, $filename: String!, $fileData: String!) {
    uploadUserImage(username: $username, filename: $filename, fileData: $fileData) {
      id
      username
      email
      role
      description
      profile_image
      display_name
    }
  }
`;

export const UPLOAD_AUTHOR_IMAGE_MUTATION = gql`
  mutation UploadAuthorImage($authorId: Int!, $filename: String!, $fileData: String!) {
    uploadAuthorImage(authorId: $authorId, filename: $filename, fileData: $fileData) {
      author_id
      name_author
      biography
      photo
      deleted_at
    }
  }
`;
