import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/ThemeContext';

export interface AuthScreenShellProps {
  children: ReactNode;
  /** Instagram-style bottom switcher strip */
  footer?: ReactNode;
  contentBottom?: number;
}

/**
 * Soft Canva-like atmosphere + Instagram-like centered content.
 * Gradient follows theme so MindPros light/dark logos stay readable.
 */
export function AuthScreenShell({
  children,
  footer,
  contentBottom = 24,
}: AuthScreenShellProps) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const gradientColors: [string, string, string] = isDark
    ? ['#030712', '#0b1329', '#0f172a']
    : ['#f0f7ff', '#ffffff', '#f8fafc'];

  return (
    <View className="flex-1 bg-[#f0f7ff] dark:bg-[#030712]">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient background glows with soft opacity */}
      <View
        style={{ pointerEvents: 'none' }}
        className={`absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl opacity-30 ${
          isDark ? 'bg-sky-500/20' : 'bg-sky-400/25'
        }`}
      />
      <View
        style={{ pointerEvents: 'none' }}
        className={`absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-25 ${
          isDark ? 'bg-indigo-500/20' : 'bg-cyan-300/30'
        }`}
      />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 28,
              paddingTop: 12,
              paddingBottom: contentBottom,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center">{children}</View>
          </ScrollView>
          {footer ? (
            <View
              className={`border-t px-6 py-4 ${
                isDark
                  ? 'border-white/10 bg-slate-950/70'
                  : 'border-black/5 bg-white/70'
              }`}
            >
              {footer}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
