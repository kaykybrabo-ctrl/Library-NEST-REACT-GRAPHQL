import { gql } from '@apollo/client';

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($bookId: Int!, $rating: Int!, $comment: String) {
    createReview(bookId: $bookId, rating: $rating, comment: $comment) {
      id
      rating
      comment
      created_at
      user {
        username
        display_name
        photo
      }
    }
  }
`;

export const BOOK_REVIEWS_QUERY = gql`
  query BookReviews($bookId: Int!) {
    bookReviews(bookId: $bookId) {
      id
      rating
      comment
      created_at
      user {
        username
        display_name
        photo
      }
    }
  }
`;

export const BOOK_RATING_QUERY = gql`
  query BookRating($bookId: Int!) {
    bookRating(bookId: $bookId) {
      averageRating
      totalReviews
    }
  }
`;

export const MY_BOOK_REVIEW_QUERY = gql`
  query MyBookReview($bookId: Int!) {
    myBookReview(bookId: $bookId) {
      id
      rating
      comment
      created_at
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: Int!) {
    deleteReview(reviewId: $reviewId)
  }
`;

export const GET_BOOK_REVIEWS_PUBLIC = gql`
  query GetBookReviewsPublic($bookId: Int!) {
    bookReviews(bookId: $bookId) {
      id
      book_id
      user_id
      rating
      comment
      created_at
      user {
        username
        display_name
      }
    }
  }
`;
