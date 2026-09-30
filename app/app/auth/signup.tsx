import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Pressable, View } from 'react-native';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { ProsCardTitle } from '@/components/uiComponents/ProsCardTitle';
import { Button } from '@/components/uiComponents/Button';
import { Text } from '@/components/uiComponents/Text';
import { AuthScreenShell } from '@/components/authComponents/Components/AuthScreenShell';
import { AuthSoftInput } from '@/components/authComponents/Components/AuthSoftInput';
import { AuthFooterSwitch } from '@/components/authComponents/Components/AuthFooterSwitch';
import { useSignup } from '@/components/authComponents/Hooks/useSignup';
import { useGoogleAuth } from '@/components/authComponents/Hooks/useGoogleAuth';

export default function SignupScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    isSubmitting,
    handleSignup,
  } = useSignup();
  const { handleGoogleAuth, isGoogleSubmitting } = useGoogleAuth('signup');

  return (
    <AuthScreenShell
      contentBottom={16}
      footer={
        <AuthFooterSwitch
          prompt="Have an account?"
          actionLabel="Log in"
          onPress={() => router.push('/auth/login')}
        />
      }
    >
      <View className="w-full gap-14" style={{ gap: 56 }}>
        <Animated.View entering={FadeIn.duration(400)} className="items-center">
          <BrandLogo
            accessibilityLabel="MindPROS company logo"
            size="xxl"
            variant="wordmark"
          />
          <View className="-mt-1">
            <ProsCardTitle accent={false} size="lg" tone="initials" />
          </View>
          <Text className="mt-3 text-center text-[22px] font-bold text-[#1c1c1c] dark:text-white">
            Sign up to create your card
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} className="w-full">
        <AuthSoftInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          error={errors.email}
          keyboardType="email-address"
          accessibilityLabel="Email"
        />

        <AuthSoftInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          error={errors.password}
          secureTextEntry
          accessibilityLabel="Password"
        />

        <AuthSoftInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          error={errors.confirmPassword}
          secureTextEntry
          accessibilityLabel="Confirm password"
        />

        <Button
          label={isSubmitting ? 'Signing up…' : 'Sign up'}
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSignup}
          className="mt-2 w-full rounded-xl"
        />

        <Text className="mt-4 text-center text-[12px] leading-4 text-[#8e8e8e] dark:text-slate-500">
          By signing up, you agree to ProsCard’s Terms and Privacy Policy.
        </Text>

        <View className="my-6 flex-row items-center">
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <Text className="mx-4 text-xs font-semibold uppercase tracking-wide text-[#8e8e8e]">Or</Text>
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </View>

        <Pressable
          onPress={handleGoogleAuth}
          disabled={isSubmitting || isGoogleSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign up with Google"
          className="items-center py-2 active:opacity-70"
        >
          <Text className="text-[14px] font-semibold text-sky-700 dark:text-sky-400">
            {isGoogleSubmitting ? 'Connecting to Google…' : 'Sign up with Google'}
          </Text>
        </Pressable>
        </Animated.View>
      </View>
    </AuthScreenShell>
  );
}
