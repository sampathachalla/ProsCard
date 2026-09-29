// app/index.tsx
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthSession } from '@/components/authComponents/Hooks/useAuthSession';

export default function IndexScreen() {
  const { isAuthenticated, isHydrating } = useAuthSession();
  if (isHydrating) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  }
  return <Redirect href={isAuthenticated ? '/(tabs)/homepage' : '/auth/welcome'} />;
}
