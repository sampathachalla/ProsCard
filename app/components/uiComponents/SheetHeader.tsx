import { View } from 'react-native';
import { Text } from './Text';

type SheetHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SheetHeader({ title, subtitle }: SheetHeaderProps) {
  return (
    <View className="mb-4">
      <Text variant="heading" className="text-xl font-bold">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="muted" className="text-xs">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
