import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { View } from 'react-native';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { ProsCardTitle } from '@/components/uiComponents/ProsCardTitle';
import { Button } from '@/components/uiComponents/Button';
import { Text } from '@/components/uiComponents/Text';
import { AuthScreenShell } from '@/components/authComponents/Components/AuthScreenShell';
import { AuthSoftInput } from '@/components/authComponents/Components/AuthSoftInput';
import { AuthFooterSwitch } from '@/components/authComponents/Components/AuthFooterSwitch';
import { useSignup } from '@/components/authComponents/Hooks/useSignup';

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
      <Animated.View entering={FadeIn.duration(400)} className="mb-6 items-center">
        <BrandLogo
          accessibilityLabel="MindPROS company logo"
          size="header"
          variant="wordmark"
        />
        <View className="mt-4">
          <ProsCardTitle size="md" />
        </View>
        <Text className="mt-4 text-center text-[22px] font-bold text-[#1c1c1c] dark:text-white">
          Sign up to create your card
        </Text>
        <Text className="mt-1.5 text-center text-[14px] text-[#737373] dark:text-slate-400">
          Free to start. Edit anytime.
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
      </Animated.View>
    </AuthScreenShell>
  );
}
