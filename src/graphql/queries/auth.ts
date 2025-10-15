import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      token
      user {
        id
        username
        role
        profile_image
        display_name
        description
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      id
      username
      role
      profile_image
      display_name
      description
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
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

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($updateProfileInput: UpdateProfileInput!) {
    updateProfile(updateProfileInput: $updateProfileInput) {
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
