import { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/components/authComponents/Components/AuthScreenShell';
import { AuthSoftInput } from '@/components/authComponents/Components/AuthSoftInput';
import { Button } from '@/components/uiComponents/Button';
import { Text } from '@/components/uiComponents/Text';
import { establishRecoverySession, logout, resetPassword } from '@/components/authComponents/Services/authService';

function recoveryTokens(url: string | null) {
  if (!url) return null;
  const fragment = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1).split('#')[0] : '';
  const params = new URLSearchParams(fragment || query);
  const accessToken = params.get('access_token');
  if (!accessToken) return null;
  return { accessToken, refreshToken: params.get('refresh_token') ?? undefined };
}

export default function ResetPasswordScreen() {
  const url = Linking.useURL();
  const router = useRouter();
  const tokens = useMemo(() => recoveryTokens(url), [url]);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tokens) return;
    establishRecoverySession(tokens.accessToken, tokens.refreshToken)
      .then(() => setReady(true))
      .catch(() => Alert.alert('Invalid link', 'This password-reset link is invalid or expired.'));
  }, [tokens]);

  const submit = async () => {
    if (password.length < 8) return Alert.alert('Password too short', 'Use at least 8 characters.');
    if (password !== confirmPassword) return Alert.alert('Passwords do not match', 'Enter the same password twice.');
    setSaving(true);
    try {
      await resetPassword(password);
      await logout();
      Alert.alert('Password updated', 'Sign in with your new password.');
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Reset failed', error instanceof Error ? error.message : 'Could not update your password.');
    } finally {
      setSaving(false);
    }
  };

  if (!tokens || !ready) {
    return <AuthScreenShell><View className="items-center gap-4"><ActivityIndicator /><Text>{tokens ? 'Verifying reset link…' : 'Open the reset link from your email.'}</Text></View></AuthScreenShell>;
  }
  return (
    <AuthScreenShell>
      <View className="w-full gap-4">
        <Text variant="heading" className="text-center">Choose a new password</Text>
        <AuthSoftInput value={password} onChangeText={setPassword} placeholder="New password" secureTextEntry accessibilityLabel="New password" />
        <AuthSoftInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" secureTextEntry accessibilityLabel="Confirm new password" />
        <Button label={saving ? 'Updating…' : 'Update password'} loading={saving} disabled={saving} onPress={submit} />
      </View>
    </AuthScreenShell>
  );
}
