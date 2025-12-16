import { gql } from '@apollo/client';

export const MY_LOANS_QUERY = gql`
  query MyLoans {
    myLoans {
      loans_id
      loan_date
      due_date
      returned_at
      is_overdue
      fine_amount
      days_remaining
      hours_remaining
      time_remaining
      title
      photo
      description
      book_id
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

export const USER_FAVORITE_BOOK_QUERY = gql`
  query UserFavoriteBook($username: String!) {
    userFavoriteBook(username: $username) {
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

export const OVERDUE_LOANS_QUERY = gql`
  query OverdueLoans {
    overdueLoans {
      loans_id
      due_date
      fine_amount
      title
    }
  }
`;

export const GET_USER_PROFILE_QUERY = gql`
  query GetUserProfile($username: String!) {
    userProfile(username: $username) {
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

export const GET_USER_LOANS_QUERY = gql`
  query GetUserLoans($username: String!) {
    userLoans(username: $username) {
      loans_id
      loan_date
      due_date
      returned_at
      is_overdue
      fine_amount
      title
      photo
      description
    }
  }
`;

export const UPDATE_USER_DESCRIPTION_MUTATION = gql`
  mutation UpdateUserDescription($username: String!, $description: String!) {
    updateUserDescription(username: $username, description: $description)
  }
`;

export const UPDATE_USER_DISPLAY_NAME_MUTATION = gql`
  mutation UpdateUserDisplayName($username: String!, $displayName: String!) {
    updateUserDisplayName(username: $username, displayName: $displayName)
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      username
      role
      profile_image
      display_name
      description
    }
  }
`;
