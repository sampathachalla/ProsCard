// components/authComponents/Hooks/useLogin.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../Services/authService';
import { getLoginInitialFields } from '../Config/authMode';
import { validateLogin, type AuthFieldErrors } from '../Utils/validateAuth';
import { getHasCompletedOnboarding } from '@/components/onboardingComponents/Services/onboardingService';

export function useLogin() {
  const initialFields = getLoginInitialFields();
  const [email, setEmail] = useState(initialFields.email);
  const [password, setPassword] = useState(initialFields.password);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateEmail = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
  };

  const handleLogin = async () => {
    const nextErrors = validateLogin(email, password);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace(await getHasCompletedOnboarding() ? '/(tabs)/homepage' : '/(tabs)/onboardingPage');
    } catch (err) {
      Alert.alert('Login Failed', err instanceof Error ? err.message : 'Could not log in. Please try again.');
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
