import { useState } from 'react';
import { Alert } from 'react-native';
import { requestPasswordReset, verifyPasswordResetCode } from '../Services/authService';
import { validateForgotPasswordEmail, type AuthFieldErrors } from '../Utils/validateAuth';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const updateEmail = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const updateRecoveryCode = (value: string) => {
    setRecoveryCode(value.replace(/\D/g, '').slice(0, 8));
    if (codeError) setCodeError('');
  };

  const handleVerifyCode = async (): Promise<boolean> => {
    if (!sentTo || !/^\d{6,8}$/.test(recoveryCode)) {
      setCodeError('Enter the 6–8 digit code from your email.');
      return false;
    }
    setIsVerifying(true);
    try {
      await verifyPasswordResetCode(sentTo, recoveryCode);
      return true;
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'The verification code is invalid or expired.');
      return false;
    } finally {
      setIsVerifying(false);
    }
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

  const changeEmail = () => {
    setSentTo(null);
    setRecoveryCode('');
    setCodeError('');
  };

  return {
    email,
    setEmail: updateEmail,
    errors,
    isSubmitting,
    sentTo,
    recoveryCode,
    setRecoveryCode: updateRecoveryCode,
    codeError,
    isVerifying,
    handleSendResetLink,
    handleVerifyCode,
    changeEmail,
  };
}
