import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { ProsCardTitle } from '@/components/uiComponents/ProsCardTitle';
import { Button } from '@/components/uiComponents/Button';
import { Text } from '@/components/uiComponents/Text';
import { AuthScreenShell } from '@/components/authComponents/Components/AuthScreenShell';
import { AuthSoftInput } from '@/components/authComponents/Components/AuthSoftInput';
import { AuthFooterSwitch } from '@/components/authComponents/Components/AuthFooterSwitch';
import { useForgotPassword } from '@/components/authComponents/Hooks/useForgotPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    errors,
    isSubmitting,
    sentTo,
    handleSendResetLink,
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
      <View className="w-full gap-14" style={{ gap: 56 }}>
        <Animated.View entering={FadeIn.duration(400)} className="items-center">
          <BrandLogo accessibilityLabel="MindPROS company logo" size="xxl" variant="wordmark" />
          <View className="-mt-1">
            <ProsCardTitle accent={false} size="lg" tone="initials" />
          </View>
          <Text className="mt-3 text-center text-[22px] font-bold text-[#1c1c1c] dark:text-white">
            {sentTo ? 'Check your inbox' : 'Reset your password'}
          </Text>
          <Text className="mt-2 px-2 text-center text-[14px] leading-5 text-[#8e8e8e] dark:text-slate-400">
            {sentTo
              ? `If an account exists for ${sentTo}, you’ll receive a link to choose a new password.`
              : 'Enter the email on your account and we’ll send you a reset link.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} className="w-full">
          {sentTo ? (
            <>
              <Button
                label="Back to log in"
                variant="primary"
                size="lg"
                onPress={() => router.push('/auth/login')}
                className="mt-2 w-full rounded-xl"
              />
              <Pressable
                onPress={handleSendResetLink}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Resend reset link"
                className="mt-4 items-center py-1 active:opacity-70"
              >
                <Text className="text-[13px] font-medium text-sky-600 dark:text-sky-400">
                  {isSubmitting ? 'Sending…' : 'Resend email'}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <AuthSoftInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
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
