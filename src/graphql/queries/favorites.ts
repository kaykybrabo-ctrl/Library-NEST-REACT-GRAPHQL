import { gql } from '@apollo/client';

export const ADD_TO_FAVORITES_MUTATION = gql`
  mutation AddToFavorites($bookId: Int!) {
    addToFavorites(bookId: $bookId) {
      success
      message
    }
  }
`;

export const MY_FAVORITE_BOOK_QUERY = gql`
  query MyFavoriteBook {
    myFavoriteBook {
      favoriteBook {
        book_id
        title
        description
        photo
        author {
          name_author
        }
      }
    }
  }
`;
