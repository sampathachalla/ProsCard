// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

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
