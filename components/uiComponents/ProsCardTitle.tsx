import { View } from 'react-native';
import { Text } from '@/components/uiComponents/Text';

type ProsCardTitleSize = 'md' | 'lg';

const sizeStyles: Record<
  ProsCardTitleSize,
  { font: string; line: string; bar: string; barMt: string }
> = {
  md: {
    font: 'text-[36px] font-black leading-[42px]',
    line: 'text-[36px] font-black',
    bar: 'w-14',
    barMt: 'mt-2.5',
  },
  lg: {
    font: 'text-[44px] font-black leading-[50px]',
    line: 'text-[44px] font-black',
    bar: 'w-[72px]',
    barMt: 'mt-3',
  },
};

export function ProsCardTitle({ size = 'lg' }: { size?: ProsCardTitleSize }) {
  const styles = sizeStyles[size];

  return (
    <View accessibilityRole="header" accessibilityLabel="ProsCard" className="items-center">
      <Text
        className={`text-center tracking-tight text-textPrimary dark:text-dark-textPrimary ${styles.font}`}
      >
        Pros
        <Text className={`${styles.line} text-primary dark:text-dark-primary`}>Card</Text>
      </Text>
      <View className={`${styles.barMt} h-1 rounded-full bg-primary dark:bg-dark-primary ${styles.bar}`} />
    </View>
  );
}
