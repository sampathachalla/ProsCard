// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuthSession } from '@/components/authComponents/Hooks/useAuthSession';

export default function TabsLayout() {
  const { isAuthenticated, isHydrating } = useAuthSession();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;
  if (isHydrating) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  if (!isAuthenticated) return <Redirect href="/auth/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.tint,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="homepage" options={{ title: 'Home' }} />
      <Tabs.Screen name="onboardingPage" options={{ href: null }} />
      <Tabs.Screen name="cardsPage" options={{ href: null }} />
      <Tabs.Screen name="scannerPage" options={{ href: null }} />
      <Tabs.Screen name="editViewPage" options={{ href: null }} />
      <Tabs.Screen name="contactsPage" options={{ href: null }} />
      <Tabs.Screen name="profilePage" options={{ href: null }} />
      <Tabs.Screen name="accountPage" options={{ href: null }} />
    </Tabs>
  );
}
