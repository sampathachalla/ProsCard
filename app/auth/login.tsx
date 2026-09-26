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
import { useLogin } from '@/components/authComponents/Hooks/useLogin';

export default function LoginScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    isSubmitting,
    handleLogin,
  } = useLogin();

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
      <Animated.View entering={FadeIn.duration(400)} className="mb-8 items-center">
        <BrandLogo
          accessibilityLabel="MindPROS company logo"
          size="header"
          variant="wordmark"
        />
        <View className="mt-4">
          <ProsCardTitle size="md" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)} className="w-full">
        <AuthSoftInput
          value={email}
          onChangeText={setEmail}
          placeholder="Phone number, username or email"
          error={errors.email}
          keyboardType="email-address"
          accessibilityLabel="Email or username"
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
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
          className="mt-4 items-center py-1 active:opacity-70"
        >
          <Text className="text-[13px] font-medium text-sky-600 dark:text-sky-400">
            Forgot password?
          </Text>
        </Pressable>

        <View className="my-7 flex-row items-center">
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <Text className="mx-4 text-xs font-semibold uppercase tracking-wide text-[#8e8e8e]">
            Or
          </Text>
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </View>

        <Pressable
          onPress={handleLogin}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          className="items-center py-2 active:opacity-70"
        >
          <Text className="text-[14px] font-semibold text-sky-700 dark:text-sky-400">
            Continue with Google
          </Text>
        </Pressable>
      </Animated.View>
    </AuthScreenShell>
  );
}
