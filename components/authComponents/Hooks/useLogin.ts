// components/authComponents/Hooks/useLogin.ts
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { login } from '../Services/authService';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
    }, [])
  );

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login(email);
      router.replace('/(tabs)/homepage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, password, setPassword, isSubmitting, handleLogin };
}
