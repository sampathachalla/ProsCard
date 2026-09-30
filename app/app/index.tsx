// app/index.tsx
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthSession } from '@/components/authComponents/Hooks/useAuthSession';
import { useQuery } from '@tanstack/react-query';
import { getHasCompletedOnboarding } from '@/components/onboardingComponents/Services/onboardingService';
import { queryKeys } from '@/services/api/queryClient';

export default function IndexScreen() {
  const { isAuthenticated, isHydrating } = useAuthSession();
  const onboarding = useQuery({ queryKey: queryKeys.onboarding, queryFn: getHasCompletedOnboarding, enabled: isAuthenticated });
  if (isHydrating || isAuthenticated && onboarding.isLoading) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  }
  if (!isAuthenticated) return <Redirect href="/auth/welcome" />;
  return <Redirect href={onboarding.data ? '/(tabs)/homepage' : '/(tabs)/onboardingPage'} />;
}
