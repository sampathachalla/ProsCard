import { useState } from 'react';
import { useRouter } from 'expo-router';
import { signInWithGoogle } from '../Services/authService';
import { getHasCompletedOnboarding } from '@/pages/onboarding/Services/onboardingService';
import { showMessage } from '@/common/ui/confirmAction';

type Options = {
  onError?: (message: string) => void;
};

export function useGoogleAuth(action: 'login' | 'signup', options: Options = {}) {
  const router = useRouter();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleAuth = async () => {
    if (isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    try {
      const user = await signInWithGoogle(action);
      if (!user) return;
      const completed = await getHasCompletedOnboarding();
      router.replace(completed ? '/(tabs)/homepage' : '/onboarding');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not continue with Google. Please try again.';
      if (options.onError) options.onError(message);
      else {
        showMessage(action === 'signup' ? 'Google Signup Failed' : 'Google Sign-In Failed', message);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return { handleGoogleAuth, isGoogleSubmitting };
}
