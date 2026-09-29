import { useState } from 'react';
import { Alert } from 'react-native';
import { requestPasswordReset } from '../Services/authService';
import { validateForgotPasswordEmail, type AuthFieldErrors } from '../Utils/validateAuth';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const updateEmail = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const handleSendResetLink = async () => {
    const nextErrors = validateForgotPasswordEmail(email);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmed = email.trim();
      await requestPasswordReset(trimmed);
      setSentTo(trimmed);
    } catch (err) {
      Alert.alert('Something Went Wrong', err instanceof Error ? err.message : 'Could not send the reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail: updateEmail,
    errors,
    isSubmitting,
    sentTo,
    handleSendResetLink,
  };
}
