import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/pages/auth/Components/AuthScreenShell';
import { AuthSoftInput } from '@/pages/auth/Components/AuthSoftInput';
import { PasswordRequirementHints } from '@/pages/auth/Components/PasswordRequirementHints';
import { AuthFormBanner } from '@/pages/auth/Components/AuthFormBanner';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { establishRecoverySession, logout, resetPassword } from '@/pages/auth/Services/authService';
import { getSession } from '@/services/api/session';

function recoveryTokens(url: string | null) {
  if (!url) return null;
  const fragment = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1).split('#')[0] : '';
  const params = new URLSearchParams(fragment || query);
  const accessToken = params.get('access_token');
  if (!accessToken) return null;
  return { accessToken, refreshToken: params.get('refresh_token') ?? undefined };
}

type RecoveryPhase = 'loading' | 'ready' | 'failed';

export default function ResetPasswordScreen() {
  const url = Linking.useURL();
  const router = useRouter();
  const tokens = useMemo(() => recoveryTokens(url), [url]);
  const [phase, setPhase] = useState<RecoveryPhase>('loading');
  const [recoveryError, setRecoveryError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const prepareRecovery = tokens
      ? establishRecoverySession(tokens.accessToken, tokens.refreshToken).then(() => true)
      : getSession().then((session) => Boolean(session?.token));
    prepareRecovery
      .then((valid) => {
        if (cancelled) return;
        if (!valid) throw new Error('No recovery session.');
        setPhase('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setRecoveryError('This password-reset link is invalid or expired.');
        setPhase('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [tokens]);

  const submit = async () => {
    setFormError('');
    if (password.length < 8) {
      setFormError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await resetPassword(password);
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not update your password.');
    } finally {
      setSaving(false);
    }
  };

  if (phase === 'loading') {
    return (
      <AuthScreenShell>
        <View className="items-center gap-4 py-8">
          <ActivityIndicator size="large" />
          <Text className="text-center text-textMuted dark:text-dark-textMuted">Verifying password recovery…</Text>
        </View>
      </AuthScreenShell>
    );
  }

  if (phase === 'failed') {
    return (
      <AuthScreenShell>
        <View className="w-full gap-4 py-4">
          <Text variant="heading" className="text-center">
            Link expired
          </Text>
          <AuthFormBanner message={recoveryError} />
          <Text className="text-center text-sm text-textMuted dark:text-dark-textMuted">
            Request a new reset email and use the latest link or verification code.
          </Text>
          <Button
            label="Request new link"
            variant="primary"
            size="lg"
            onPress={() => router.replace('/auth/forgot-password')}
            className="w-full rounded-xl"
          />
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell>
      <View className="w-full gap-2">
        <Text variant="heading" className="mb-2 text-center">
          Choose a new password
        </Text>
        <AuthFormBanner message={formError} />
        <AuthSoftInput
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (formError) setFormError('');
          }}
          placeholder="New password"
          secureTextEntry
          accessibilityLabel="New password"
        />
        <PasswordRequirementHints password={password} />
        <AuthSoftInput
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            if (formError) setFormError('');
          }}
          placeholder="Confirm password"
          secureTextEntry
          accessibilityLabel="Confirm new password"
        />
        <Button
          label={saving ? 'Updating…' : 'Update password'}
          loading={saving}
          disabled={saving}
          onPress={submit}
          className="mt-2 rounded-xl"
        />
      </View>
    </AuthScreenShell>
  );
}
