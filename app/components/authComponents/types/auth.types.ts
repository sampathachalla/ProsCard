// components/authComponents/types/auth.types.ts
export type StoredUser = {
  id: string;
  username: string;
  token?: string;
  refreshToken?: string;
  emailConfirmationRequired?: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = LoginCredentials & {
  confirmPassword: string;
};

export type UserRole = 'Trainer' | 'Member';

export type SignupForm = {
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserRole;
};
