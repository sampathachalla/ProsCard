// components/authComponents/Hooks/useLogin.ts
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { login } from '../Services/authService';
import type { AuthFieldErrors } from '../Utils/validateAuth';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setErrors({});
    }, [])
  );

  const updateEmail = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
  };

  const handleLogin = async () => {
    // TEMP: bypass auth validation — go straight to homepage.
    setIsSubmitting(true);
    try {
      await login(email.trim() || 'guest');
      router.replace('/(tabs)/homepage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail: updateEmail,
    password,
    setPassword: updatePassword,
    errors,
    isSubmitting,
    handleLogin,
  };
}
