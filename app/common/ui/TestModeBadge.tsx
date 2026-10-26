import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';
import { Text } from './Text';

/**
 * Small "Test mode" label shown while EXPO_PUBLIC_AUTH_TEST_MODE=true, so it is obvious that sign-in
 * and onboarding are local only and nothing reaches the backend. Renders nothing otherwise.
 */
export function TestModeBadge() {
  const insets = useSafeAreaInsets();
  if (!AUTH_TEST_MODE) return null;
  return (
    <View
      pointerEvents="none"
      accessibilityLabel="Test mode: no backend calls"
      className="absolute left-4 flex-row items-center rounded-full bg-amber-500 px-2.5 py-1"
      style={{ top: insets.top + 6 }}
    >
      <View className="mr-1.5 size-1.5 rounded-full bg-white" />
      <Text variant="none" className="text-[11px] font-bold uppercase text-white">
        Test mode
      </Text>
    </View>
  );
}
