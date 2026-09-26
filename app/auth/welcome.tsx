import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFooterSwitch } from '@/components/authComponents/Components/AuthFooterSwitch';
import { AuthWelcomeContent } from '@/components/authComponents/Components/AuthWelcomeContent';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <AuthWelcomeContent
        onGetStarted={() => router.push('/auth/signup')}
        footer={
          <AuthFooterSwitch
            prompt="Already have an account?"
            actionLabel="Log in"
            onPress={() => router.push('/auth/login')}
          />
        }
      />
    </SafeAreaView>
  );
}
