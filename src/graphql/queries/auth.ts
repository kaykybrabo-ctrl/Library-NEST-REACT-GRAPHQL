import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
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

export const UPLOAD_PROFILE_IMAGE_MUTATION = gql`
  mutation UploadProfileImage($file: String!, $username: String!) {
    uploadProfileImage(file: $file, username: $username)
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($username: String!) {
    forgotPassword(username: $username)
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($newPassword: String!, $token: String, $username: String) {
    resetPassword(newPassword: $newPassword, token: $token, username: $username)
  }
`;
