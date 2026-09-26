import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';

// Load Tailwind styles only on web (for NativeWind)
if (typeof window !== 'undefined') {
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
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style={Platform.OS === 'android' ? 'light' : 'auto'} />
      </BottomSheetModalProvider>
    </View>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedLayoutWrapper />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
