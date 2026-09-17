// components/authComponents/types/auth.types.ts
export type StoredUser = {
  id: string;
  username: string;
};

export type UserRole = 'Trainer' | 'Member';

export type SignupForm = {
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserRole;
};
