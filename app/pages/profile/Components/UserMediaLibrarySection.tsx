import type { LucideIcon } from 'lucide-react-native';
import { ImageIcon } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Text } from '@/common/ui/Text';
import type { ProfileMediaKind, UserMediaLibraryItem } from '@/services/api/types';
import { UserMediaThumbGrid, layoutForMediaKind } from './UserMediaThumbGrid';

type IconProp = LucideIcon;

type Props = {
  title: string;
  description: string;
  icon?: IconProp;
  kind: ProfileMediaKind;
  items: UserMediaLibraryItem[];
  loading?: boolean;
  onDeleteItem?: (item: UserMediaLibraryItem) => void;
};

/** One category block in the user media library (header + grid or empty state). */
export function UserMediaLibrarySection({
  title,
  description,
  icon: Icon = ImageIcon,
  kind,
  items,
  loading = false,
  onDeleteItem,
}: Props) {
  const layout = layoutForMediaKind(kind);
  const SectionIcon = Icon ?? ImageIcon;

  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 dark:bg-dark-primary/15">
          <SectionIcon color={Colors.light.tint} size={20} strokeWidth={2.2} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text variant="subtitle">{title}</Text>
            <Text variant="tiny" className="font-semibold uppercase tracking-wider">
              {items.length}
            </Text>
          </View>
          <Text variant="muted" className="mt-0.5">
            {description}
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-card/60 dark:border-slate-600 dark:bg-dark-card/40">
          <ActivityIndicator color={Colors.light.tint} />
        </View>
      ) : items.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-slate-300 bg-card/60 px-4 py-8 dark:border-slate-600 dark:bg-dark-card/40">
          <Text className="text-center text-sm font-medium text-textPrimary dark:text-dark-textPrimary">
            No uploads yet
          </Text>
          <Text variant="muted" className="mt-1 text-center text-sm">
            Add one from Account details or when editing a card.
          </Text>
        </View>
      ) : (
        <UserMediaThumbGrid items={items} layout={layout} onDelete={onDeleteItem} />
      )}
    </View>
  );
}
