import { View } from 'react-native';
import { Text } from '@/common/ui/Text';

type Props = {
  title: string;
  topInset: number;
};

/** Header bar above the card showing the card title. */
export function CardTitleBadge({ title, topInset }: Props) {
  return (
    <View
      className="items-center border-b border-slate-200 bg-background px-4 pb-3 dark:border-slate-800 dark:bg-dark-background"
      style={{ paddingTop: Math.max(topInset, 12) + 4 }}
    >
      <View className="max-w-[80%] rounded-xl border border-slate-300 bg-card px-5 py-2 dark:border-slate-700 dark:bg-dark-card">
        <Text variant="none" numberOfLines={1} className="text-base font-bold text-textPrimary dark:text-dark-textPrimary">
          {title}
        </Text>
      </View>
    </View>
  );
}
