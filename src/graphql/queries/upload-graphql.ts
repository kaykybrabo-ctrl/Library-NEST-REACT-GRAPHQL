import { gql } from '@apollo/client';

export const UPLOAD_BOOK_IMAGE_PURE_GRAPHQL_MUTATION = gql`
  mutation UploadBookImagePureGraphQL($bookId: Int!, $filename: String!, $fileData: String!) {
    uploadBookImagePureGraphQL(bookId: $bookId, filename: $filename, fileData: $fileData)
  }
`;
