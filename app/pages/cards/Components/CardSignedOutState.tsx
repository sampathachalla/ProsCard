import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/common/ui/BrandLogo';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';

type CardSignedOutStateProps = {
  onGoToWelcome: () => void;
};

/** Shown when a widget or Live Activity opens a card after the user has logged out. */
export function CardSignedOutState({ onGoToWelcome }: CardSignedOutStateProps) {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-1 items-center justify-center px-8">
        <BrandLogo size="xl" />
        <Text variant="heading" className="mt-6 text-center">
          Log in to view this card
        </Text>
        <Text variant="muted" className="mt-2 text-center">
          You are logged out of VC Pros. Log in to your account to open this card.
        </Text>
        <Button label="Go to welcome page" className="mt-8 w-full" onPress={onGoToWelcome} />
      </View>
    </SafeAreaView>
  );
}
