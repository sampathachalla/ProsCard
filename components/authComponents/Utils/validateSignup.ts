// components/authComponents/Utils/validateSignup.ts
import type { SignupForm } from '../types/auth.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(form: SignupForm): string | null {
  if (!EMAIL_PATTERN.test(form.email.trim())) return 'Enter a valid email address.';
  if (form.password.length < 6) return 'Password must be at least 6 characters.';
  if (form.password !== form.confirmPassword) return 'Passwords do not match.';
  return null;
}
