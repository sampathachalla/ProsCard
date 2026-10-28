import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { View } from 'react-native';
import { BrandLogo } from '@/common/ui/BrandLogo';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { AuthScreenShell } from '@/pages/auth/Components/AuthScreenShell';
import { AuthSoftInput } from '@/pages/auth/Components/AuthSoftInput';
import { AuthFooterSwitch } from '@/pages/auth/Components/AuthFooterSwitch';
import { AuthFormBanner } from '@/pages/auth/Components/AuthFormBanner';
import { GoogleSignInButton } from '@/pages/auth/Components/GoogleSignInButton';
import { PasswordRequirementHints } from '@/pages/auth/Components/PasswordRequirementHints';
import { useSignup } from '@/pages/auth/Hooks/useSignup';
import { useGoogleAuth } from '@/pages/auth/Hooks/useGoogleAuth';

export default function SignupScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    formError,
    setFormError,
    isSubmitting,
    handleSignup,
  } = useSignup();
  const { handleGoogleAuth, isGoogleSubmitting } = useGoogleAuth('signup', {
    onError: (message) => setFormError(message),
  });

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
      <View className="w-full">
        <Animated.View entering={FadeIn.duration(400)} className="mb-6 items-center">
          <BrandLogo accessibilityLabel="VCPROS logo" size="xxl" variant="wordmark" />
          <Text className="mt-3 text-center text-[22px] font-bold text-[#1c1c1c] dark:text-white">
            Sign up to create your card
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} className="w-full">
          <AuthFormBanner message={formError} />

          <AuthSoftInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email address"
          />

          <AuthSoftInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            error={errors.password}
            secureTextEntry
            accessibilityLabel="Password"
          />
          <PasswordRequirementHints password={password} />

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
            By signing up, you agree to VC Pros’s Terms and Privacy Policy.
          </Text>

          <View className="my-5 flex-row items-center">
            <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <Text className="mx-4 text-xs font-semibold uppercase tracking-wide text-[#8e8e8e]">Or</Text>
            <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </View>

          <GoogleSignInButton
            label={isGoogleSubmitting ? 'Connecting to Google…' : 'Sign up with Google'}
            loading={isGoogleSubmitting}
            disabled={isSubmitting}
            onPress={handleGoogleAuth}
          />
        </Animated.View>
      </View>
    </AuthScreenShell>
  );
}
