import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BrandLogo } from '@/common/ui/BrandLogo';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { AuthScreenShell } from '@/pages/auth/Components/AuthScreenShell';
import { AuthSoftInput } from '@/pages/auth/Components/AuthSoftInput';
import { AuthFooterSwitch } from '@/pages/auth/Components/AuthFooterSwitch';
import { AuthFormBanner } from '@/pages/auth/Components/AuthFormBanner';
import { GoogleSignInButton } from '@/pages/auth/Components/GoogleSignInButton';
import { useLogin } from '@/pages/auth/Hooks/useLogin';
import { useGoogleAuth } from '@/pages/auth/Hooks/useGoogleAuth';

export default function LoginScreen() {
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
    handleLogin,
  } = useLogin();
  const { handleGoogleAuth, isGoogleSubmitting } = useGoogleAuth('login', {
    onError: (message) => setFormError(message),
  });

  return (
    <AuthScreenShell
      footer={
        <AuthFooterSwitch
          prompt="Don't have an account?"
          actionLabel="Sign up"
          onPress={() => router.push('/auth/signup')}
        />
      }
    >
      <View className="w-full">
        <Animated.View entering={FadeIn.duration(400)} className="mb-6 items-center">
          <BrandLogo accessibilityLabel="VCPROS logo" size="xxl" variant="wordmark" />
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

          <Button
            label={isSubmitting ? 'Logging in…' : 'Log in'}
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleLogin}
            className="mt-2 w-full rounded-xl"
          />

          <Pressable
            onPress={() => router.push('/auth/forgot-password')}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
            className="mt-4 items-center py-1 active:opacity-70"
          >
            <Text className="text-[13px] font-medium text-sky-600 dark:text-sky-400">
              Forgot password?
            </Text>
          </Pressable>

          <View className="my-5 flex-row items-center">
            <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <Text className="mx-4 text-xs font-semibold uppercase tracking-wide text-[#8e8e8e]">
              Or
            </Text>
            <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </View>

          <GoogleSignInButton
            label={isGoogleSubmitting ? 'Connecting to Google…' : 'Continue with Google'}
            loading={isGoogleSubmitting}
            disabled={isSubmitting}
            onPress={handleGoogleAuth}
          />
        </Animated.View>
      </View>
    </AuthScreenShell>
  );
}
