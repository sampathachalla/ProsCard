import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/api/queryClient';
import { AppErrorBoundary } from '@/components/uiComponents/AppErrorBoundary';

// Load Tailwind styles only on web (for NativeWind)
if (typeof window !== 'undefined') {
  // Runtime-gated because importing the web stylesheet on native breaks bundling.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../global.css');
}

/**
 * Do NOT wrap <Stack /> in SafeAreaView — that breaks the navigation tree
 * Expo Router provides NavigationContainer; screens own their safe-area insets.
 */
function ThemedLayoutWrapper() {
  const { theme } = useThemeContext();

  return (
    <View className={theme === 'dark' ? 'dark flex-1' : 'flex-1'}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="cards/[cardId]" />
          <Stack.Screen name="contacts/new" />
          <Stack.Screen name="contacts/[contactId]" />
          <Stack.Screen name="share/[slug]" />
          <Stack.Screen
            name="scanner"
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style={Platform.OS === 'android' ? 'light' : 'auto'} />
      </BottomSheetModalProvider>
    </View>
  );
}

// Catches render errors in every screen so one failure shows a recovery screen instead of closing the app.
export { AppErrorBoundary as ErrorBoundary };

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ThemedLayoutWrapper />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
