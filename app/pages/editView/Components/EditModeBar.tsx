import { Pressable, View } from 'react-native';
import type { EditHomeTab } from '@/common/ui/EditHomeBar';
import { Text } from '@/common/ui/Text';
import { EDIT_MODES, Z_INDEX } from '../editViewConstants';

type Props = {
  backgroundColor: string;
  bottomInset: number;
  windowWidth: number;
  onOpen: (tab: EditHomeTab) => void;
};

/** Bottom bar shown before editing starts: opens the editor in Layout, Content or Styling mode. */
export function EditModeBar({ backgroundColor, bottomInset, windowWidth, onOpen }: Props) {
  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card"
      style={{
        backgroundColor,
        elevation: 28,
        paddingBottom: Math.max(bottomInset, 8),
        paddingHorizontal: windowWidth < 380 ? 4 : 10,
        paddingTop: 6,
        zIndex: Z_INDEX.bottomBar,
      }}
    >
      <View className="flex-row" style={{ alignSelf: 'center', maxWidth: 760, width: '100%' }}>
        {EDIT_MODES.map(({ icon: Icon, id, label }) => (
          <Pressable
            key={id}
            accessibilityLabel={`Open ${label} editor`}
            accessibilityRole="button"
            onPress={() => onOpen(id)}
            className="min-w-0 flex-1 items-center justify-center px-1 active:opacity-70"
            style={{ minHeight: 52, paddingVertical: 3 }}
          >
            <Icon color="#3b82f6" size={19} strokeWidth={2.2} />
            <Text className="mt-1 text-center text-[10px] font-semibold text-textPrimary dark:text-dark-textPrimary" numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
