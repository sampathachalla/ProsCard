import type { SignupForm } from '../types/auth.types';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthFieldErrors = Record<string, string>;

export function validateLogin(email: string, password: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const trimmed = email.trim();
  if (!trimmed) {
    errors.email = 'Email or username is required.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

export function validateSignupFields(form: SignupForm): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = form.email.trim();

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

/** Legacy single-message helper kept for existing callers. */
export function validateSignup(form: SignupForm): string | null {
  const errors = validateSignupFields(form);
  return Object.values(errors)[0] ?? null;
}
