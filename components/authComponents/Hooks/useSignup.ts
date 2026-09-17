// components/authComponents/Hooks/useSignup.ts
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { UserRole } from '../types/auth.types';
import { validateSignup } from '../Utils/validateSignup';

export function useSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserRole>('Member');

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUserType('Member');
    }, [])
  );

  const handleSignup = () => {
    const error = validateSignup({ email, password, confirmPassword, userType });
    if (error) {
      Alert.alert('Check your details', error);
      return;
    }
    Alert.alert('Account created', 'Sign up flow coming soon.');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    userType,
    setUserType,
    handleSignup,
  };
}
