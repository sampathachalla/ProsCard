import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from './IconButton';
import { Text } from './Text';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBackPress?: () => void;
  showBackButton?: boolean;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  right,
  onBackPress,
  showBackButton = true,
  className = '',
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/homepage');
    }
  };

  return (
    <View className={`flex-row items-center px-5 pb-3 pt-3 ${className}`}>
      {showBackButton ? (
        <IconButton
          accessibilityLabel="Go back"
          icon={ArrowLeft}
          variant="ghost"
          onPress={handleBack}
        />
      ) : null}

      <View className={`min-w-0 flex-1 ${showBackButton ? 'ml-3' : ''}`}>
        <Text variant="heading" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="muted" className="mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right ? <View className="ml-auto">{right}</View> : null}
    </View>
  );
}
