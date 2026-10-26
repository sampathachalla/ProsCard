import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from '@/common/ui/IconButton';
import { Text } from '@/common/ui/Text';

type Props = {
  title: string;
  topInset: number;
  onBackPress: () => void;
};

/** Full card screen header: back (left) + card tag (center). */
export function CardTitleBadge({ title, topInset, onBackPress }: Props) {
  return (
    <View
      className="flex-row items-center border-b border-slate-200 bg-background px-3 pb-3 dark:border-slate-800 dark:bg-dark-background"
      style={{ paddingTop: Math.max(topInset, 12) + 4 }}
    >
      <IconButton accessibilityLabel="Go back" icon={ArrowLeft} variant="ghost" onPress={onBackPress} />
      <View className="min-w-0 flex-1 items-center px-2">
        <View className="max-w-full rounded-xl border border-slate-300 bg-card px-5 py-2 dark:border-slate-700 dark:bg-dark-card">
          <Text variant="none" numberOfLines={1} className="text-base font-bold text-textPrimary dark:text-dark-textPrimary">
            {title}
          </Text>
        </View>
      </View>
      {/* Balances the back button so the tag stays centered */}
      <View className="w-11" />
    </View>
  );
}
