// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuthSession } from '@/pages/auth/Hooks/useAuthSession';
import { HomeTabBar } from '@/pages/home/Components/HomeTabBar';

export default function TabsLayout() {
  const { isAuthenticated, isHydrating } = useAuthSession();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const appBackground = isDark ? Colors.dark.background : Colors.light.background;
  const tabBarLayoutHeight = 96 + Math.max(insets.bottom, 8);

  if (isHydrating) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: appBackground }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/auth/login" />;

  return (
    <View className="flex-1" style={{ backgroundColor: appBackground }}>
      <Tabs
        backBehavior="history"
        tabBar={(props) => <HomeTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />,
          tabBarStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            shadowRadius: 0,
            height: tabBarLayoutHeight,
          },
          sceneStyle: {
            backgroundColor: appBackground,
          },
        }}
      >
        <Tabs.Screen name="homepage" options={{ title: 'Cards' }} />
        <Tabs.Screen name="contactsPage" options={{ title: 'Contacts' }} />
        <Tabs.Screen name="sharePage" options={{ title: 'Share' }} />
        <Tabs.Screen name="scannerPage" options={{ title: 'Scan' }} />
        <Tabs.Screen name="profilePage" options={{ title: 'Settings' }} />
        <Tabs.Screen name="addCardPage" options={{ href: null }} />
        <Tabs.Screen name="onboardingPage" options={{ href: null }} />
        <Tabs.Screen name="cardsPage" options={{ href: null }} />
        <Tabs.Screen name="editViewPage" options={{ href: null }} />
        <Tabs.Screen name="accountPage" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
