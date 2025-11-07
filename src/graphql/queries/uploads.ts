import { gql } from '@apollo/client';

export const UPLOAD_BOOK_IMAGE_GRAPHQL = gql`
  mutation UploadBookImageGraphQL($bookId: Int!, $filename: String!, $fileData: String!) {
    uploadBookImagePureGraphQL(bookId: $bookId, filename: $filename, fileData: $fileData)
  }
`;

export const UPLOAD_AUTHOR_IMAGE_GRAPHQL = gql`
  mutation UploadAuthorImageGraphQL($authorId: Int!, $filename: String!, $fileData: String!) {
    uploadAuthorImagePureGraphQL(authorId: $authorId, filename: $filename, fileData: $fileData)
  }
`;

export const UPLOAD_USER_IMAGE_GRAPHQL = gql`
  mutation UploadUserImageGraphQL($userId: Int!, $filename: String!, $fileData: String!) {
    uploadUserImagePureGraphQL(userId: $userId, filename: $filename, fileData: $fileData)
  }
`;
