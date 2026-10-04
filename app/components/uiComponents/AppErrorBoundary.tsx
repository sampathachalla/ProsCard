import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type ErrorBoundaryProps } from 'expo-router';
import { AlertTriangle, RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

/**
 * Shown by Expo Router in place of a screen that threw while rendering, so one broken screen never
 * closes the whole app. Rendered outside the app's providers, so it only uses plain styles.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const [retrying, setRetrying] = useState(false);

  const tryAgain = async () => {
    setRetrying(true);
    try {
      await retry();
    } finally {
      setRetrying(false);
    }
  };

  const goHome = () => {
    try {
      router.replace('/');
    } catch {
      void tryAgain();
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.badge}>
        <AlertTriangle color={Colors.palette.toggleYellow} size={26} strokeWidth={2.4} />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>This screen ran into a problem. Your data is safe. Try again, or go back to the start.</Text>
      {__DEV__ ? (
        <Text style={styles.details} numberOfLines={6}>
          {error.message}
        </Text>
      ) : null}
      <Pressable accessibilityRole="button" onPress={tryAgain} disabled={retrying} style={[styles.primary, retrying && styles.disabled]}>
        <RotateCcw color="#FFFFFF" size={18} />
        <Text style={styles.primaryText}>{retrying ? 'Retrying…' : 'Try again'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={goHome} style={styles.secondary}>
        <Text style={styles.secondaryText}>Go to start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: Colors.palette.midnightBase,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250,204,21,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.34)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
  message: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  details: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    alignSelf: 'stretch',
    marginTop: 28,
    borderRadius: 16,
    backgroundColor: Colors.palette.primaryCta,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondary: {
    marginTop: 14,
    paddingVertical: 8,
  },
  secondaryText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
});
