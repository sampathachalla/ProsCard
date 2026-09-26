// components/authComponents/Hooks/useSignup.ts
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { login } from '../Services/authService';
import type { AuthFieldErrors } from '../Utils/validateAuth';

export function useSignup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }, [])
  );

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSignup = async () => {
    // TEMP: bypass auth validation — go straight to onboarding.
    setIsSubmitting(true);
    try {
      await login(email.trim() || 'guest');
      router.replace('/(tabs)/onboardingPage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail: (value: string) => {
      setEmail(value);
      clearFieldError('email');
    },
    password,
    setPassword: (value: string) => {
      setPassword(value);
      clearFieldError('password');
    },
    confirmPassword,
    setConfirmPassword: (value: string) => {
      setConfirmPassword(value);
      clearFieldError('confirmPassword');
    },
    errors,
    isSubmitting,
    handleSignup,
  };
}
