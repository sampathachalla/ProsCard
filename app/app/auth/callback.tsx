import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/components/authComponents/Components/AuthScreenShell';
import { Text } from '@/components/uiComponents/Text';
import { completeGoogleRedirect } from '@/components/authComponents/Services/authService';
import { getSession } from '@/services/api/session';

/**
 * Google sign-in returns here. In a web popup, the opener finishes sign-in and this window closes.
 * When the app lands here directly (Android deep link, or a web redirect without a popup),
 * finish sign-in from the URL tokens unless it already happened, then let `/` route onward.
 */
export default function AuthCallbackScreen() {
  const url = Linking.useURL();
  const router = useRouter();
  const handled = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (WebBrowser.maybeCompleteAuthSession().type === 'success') return;
    if (!url || handled.current) return;
    handled.current = true;

    (async () => {
      try {
        const existing = await getSession();
        if (!existing?.token && /access_token=|error=/.test(url)) await completeGoogleRedirect(url);
        router.replace('/');
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not finish signing in with Google.');
      }
    })();
  }, [router, url]);

  return (
    <AuthScreenShell>
      <View className="items-center gap-4">
        {error ? null : <ActivityIndicator />}
        <Text className="text-center">{error ?? 'Signing you in with Google…'}</Text>
        {error ? (
          <Text className="text-center font-semibold text-primary" onPress={() => router.replace('/auth/login')}>
            Back to login
          </Text>
        ) : null}
      </View>
    </AuthScreenShell>
  );
}
