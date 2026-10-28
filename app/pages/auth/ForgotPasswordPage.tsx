import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BrandLogo } from '@/common/ui/BrandLogo';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { AuthScreenShell } from '@/pages/auth/Components/AuthScreenShell';
import { AuthSoftInput } from '@/pages/auth/Components/AuthSoftInput';
import { AuthFooterSwitch } from '@/pages/auth/Components/AuthFooterSwitch';
import { useForgotPassword } from '@/pages/auth/Hooks/useForgotPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    errors,
    isSubmitting,
    sentTo,
    recoveryCode,
    setRecoveryCode,
    codeError,
    isVerifying,
    handleSendResetLink,
    handleVerifyCode,
    changeEmail,
  } = useForgotPassword();

  return (
    <AuthScreenShell
      footer={
        <AuthFooterSwitch
          prompt="Remember your password?"
          actionLabel="Log in"
          onPress={() => router.push('/auth/login')}
        />
      }
    >
      <View className="w-full">
        <Animated.View entering={FadeIn.duration(400)} className="mb-6 items-center">
          <BrandLogo accessibilityLabel="VCPROS logo" size="xxl" variant="wordmark" />
          <Text className="mt-3 text-center text-[22px] font-bold text-[#1c1c1c] dark:text-white">
            {sentTo ? 'Check your inbox' : 'Reset your password'}
          </Text>
          <Text className="mt-2 px-2 text-center text-[14px] leading-5 text-[#8e8e8e] dark:text-slate-400">
            {sentTo
              ? `Enter the verification code sent to ${sentTo}. You can also open the reset link if your email includes one.`
              : 'Enter the email on your account and we’ll send password-reset instructions.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} className="w-full">
          {sentTo ? (
            <>
              <AuthSoftInput
                value={recoveryCode}
                onChangeText={setRecoveryCode}
                placeholder="Verification code"
                error={codeError}
                keyboardType="number-pad"
                maxLength={8}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                accessibilityLabel="Password reset verification code"
              />
              <Button
                label={isVerifying ? 'Verifying…' : 'Verify code'}
                variant="primary"
                size="lg"
                loading={isVerifying}
                disabled={isVerifying}
                onPress={async () => {
                  if (await handleVerifyCode()) router.push('/auth/reset-password');
                }}
                className="mt-2 w-full rounded-xl"
              />
              <Pressable
                onPress={handleSendResetLink}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Resend password reset email"
                className="mt-4 items-center py-1 active:opacity-70"
              >
                <Text className="text-[13px] font-medium text-sky-600 dark:text-sky-400">
                  {isSubmitting ? 'Sending…' : 'Resend email'}
                </Text>
              </Pressable>
              <Pressable
                onPress={changeEmail}
                accessibilityRole="button"
                accessibilityLabel="Change email address"
                className="mt-2 items-center py-1 active:opacity-70"
              >
                <Text className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
                  Wrong email? Change address
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <AuthSoftInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                error={errors.email}
                keyboardType="email-address"
                accessibilityLabel="Email for password reset"
              />

              <Button
                label={isSubmitting ? 'Sending…' : 'Send reset link'}
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                onPress={handleSendResetLink}
                className="mt-2 w-full rounded-xl"
              />
            </>
          )}
        </Animated.View>
      </View>
    </AuthScreenShell>
  );
}
