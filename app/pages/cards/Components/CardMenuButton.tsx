import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MoreHorizontal } from 'lucide-react-native';

type Props = {
  bottomInset: number;
  onPress: () => void;
};

/** Footer bar below the card with the "⋯" button that opens the card menu. */
export function CardMenuButton({ bottomInset, onPress }: Props) {
  return (
    <View
      className="items-center border-t border-slate-200 bg-background px-4 pt-3 dark:border-slate-800 dark:bg-dark-background"
      style={{ paddingBottom: Math.max(bottomInset, 12) }}
    >
      <Pressable
        accessibilityLabel="Card options"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress();
        }}
        className="h-10 w-24 items-center justify-center rounded-full border border-slate-300 bg-card active:scale-95 dark:border-slate-700 dark:bg-dark-card"
      >
        <MoreHorizontal color="#64748b" size={24} strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}
