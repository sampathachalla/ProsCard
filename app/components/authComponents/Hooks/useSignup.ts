// components/authComponents/Hooks/useSignup.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signup } from '../Services/authService';
import { getSignupInitialFields } from '../Config/authMode';
import { validateSignupFields, type AuthFieldErrors } from '../Utils/validateAuth';

export function useSignup() {
  const router = useRouter();
  const initialFields = getSignupInitialFields();
  const [email, setEmail] = useState(initialFields.email);
  const [password, setPassword] = useState(initialFields.password);
  const [confirmPassword, setConfirmPassword] = useState(initialFields.confirmPassword);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSignup = async () => {
    const nextErrors = validateSignupFields({ email, password, confirmPassword });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signup({ email: email.trim(), password, confirmPassword });
      if (user.emailConfirmationRequired) {
        Alert.alert('Check your email', 'Confirm your email address, then sign in to continue.');
        router.replace('/auth/login');
        return;
      }
      router.replace('/(tabs)/onboardingPage');
    } catch (err) {
      Alert.alert('Signup Failed', err instanceof Error ? err.message : 'Could not create your account. Please try again.');
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
