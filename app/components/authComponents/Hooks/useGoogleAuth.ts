import { useState } from 'react';
import { useRouter } from 'expo-router';
import { signInWithGoogle } from '../Services/authService';
import { getHasCompletedOnboarding } from '@/components/onboardingComponents/Services/onboardingService';
import { showMessage } from '@/components/uiComponents/confirmAction';

export function useGoogleAuth(action: 'login' | 'signup') {
  const router = useRouter();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleAuth = async () => {
    if (isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    try {
      const user = await signInWithGoogle();
      if (!user) return;
      const completed = await getHasCompletedOnboarding();
      router.replace(completed ? '/(tabs)/homepage' : '/(tabs)/onboardingPage');
    } catch (error) {
      showMessage(
        action === 'signup' ? 'Google Signup Failed' : 'Google Sign-In Failed',
        error instanceof Error ? error.message : 'Could not continue with Google. Please try again.',
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return { handleGoogleAuth, isGoogleSubmitting };
}
