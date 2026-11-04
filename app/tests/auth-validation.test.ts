import { describe, expect, it } from 'vitest';
import { validateSignupFields } from '@/pages/auth/Utils/validateAuth';

describe('signup password confirmation', () => {
  it('requires the password to be entered twice', () => {
    expect(validateSignupFields({
      email: 'person@example.com',
      password: 'StrongPassword1!',
      confirmPassword: '',
    })).toMatchObject({ confirmPassword: 'Enter your password again.' });
  });

  it('rejects a confirmation that does not match', () => {
    expect(validateSignupFields({
      email: 'person@example.com',
      password: 'StrongPassword1!',
      confirmPassword: 'DifferentPassword1!',
    })).toMatchObject({ confirmPassword: 'Passwords do not match.' });
  });

  it('accepts matching passwords', () => {
    expect(validateSignupFields({
      email: 'person@example.com',
      password: 'StrongPassword1!',
      confirmPassword: 'StrongPassword1!',
    })).toEqual({});
  });
});
