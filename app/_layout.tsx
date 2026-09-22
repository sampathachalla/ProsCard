import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';

// Load Tailwind styles only on web (for NativeWind)
if (typeof window !== 'undefined') {
  require('../global.css');
}

// 🔄 Custom inner layout wrapper to apply dynamic dark mode class
function ThemedLayoutWrapper() {
  const { theme } = useThemeContext();

  return (
    <SafeAreaProvider>
      <BottomSheetModalProvider>
        {/* ⚠️ Apply dark mode class based on theme */}
        <View className={theme === 'dark' ? 'dark flex-1' : 'flex-1'}>
          <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top', 'left', 'right']}>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style={Platform.OS === 'android' ? 'light' : 'auto'} />
          </SafeAreaView>
        </View>
      </BottomSheetModalProvider>
    </SafeAreaProvider>
  );
}

// ✅ Final Export
export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedLayoutWrapper />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
