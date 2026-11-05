// app/index.tsx
import { Redirect } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useAuthSession } from '@/pages/auth/Hooks/useAuthSession';
import { useQuery } from '@tanstack/react-query';
import { getHasCompletedOnboarding } from '@/pages/onboarding/Services/onboardingService';
import { queryKeys } from '@/services/api/queryClient';

export default function IndexScreen() {
  const { isAuthenticated, isHydrating } = useAuthSession();
  const onboarding = useQuery({ queryKey: queryKeys.onboarding, queryFn: getHasCompletedOnboarding, enabled: isAuthenticated });
  if (isHydrating || isAuthenticated && onboarding.isLoading) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  }
  if (!isAuthenticated) return <Redirect href="/auth/welcome" />;
  // Never guess: sending an existing user to onboarding would let it overwrite their primary card.
  if (onboarding.isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8 dark:bg-dark-background">
        <Text className="text-center text-base text-textPrimary dark:text-dark-textPrimary">
          Could not reach VC Pros. Check your internet connection and try again.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => void onboarding.refetch()} className="rounded-xl bg-primary px-6 py-3 active:opacity-80">
          <Text className="font-bold text-white">{onboarding.isFetching ? 'Trying…' : 'Try again'}</Text>
        </Pressable>
      </View>
    );
  }
  return <Redirect href={onboarding.data ? '/(tabs)/homepage' : '/onboarding'} />;
}
