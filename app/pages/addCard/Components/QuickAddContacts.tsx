import { Pressable, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import type { DynamicCardField } from '@/pages/cards/types/card.types';
import { CONTACT_OPTIONS } from '../Config/addCardFields';

const normalize = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, '');

type Props = {
  existing: DynamicCardField[];
  pendingFieldId: string | null;
  onConfirm: () => void;
  onMore: () => void;
};

/** Opens the complete contact-method picker without crowding the form with suggestion chips. */
export function QuickAddContacts({ existing, pendingFieldId, onConfirm, onMore }: Props) {
  const used = new Set(existing.map((field) => normalize(field.title)));
  const available = CONTACT_OPTIONS.filter((option) => !used.has(normalize(option.title)));
  const pendingField = existing.find((field) => field.id === pendingFieldId);
  const isPendingValueEmpty = Boolean(pendingField && !pendingField.value.trim());
  const buttonLabel = pendingField ? `Add ${pendingField.title}` : 'Add more';

  if (!available.length && !pendingField) {
    return (
      <Text variant="muted" className="mt-1 text-center">
        Every contact method is already on this card.
      </Text>
    );
  }

  return (
    <View className="mt-1">
      <Pressable
        accessibilityLabel={`${buttonLabel} contact method`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isPendingValueEmpty }}
        disabled={isPendingValueEmpty}
        onPress={pendingField ? onConfirm : onMore}
        className={`min-h-[48px] w-full flex-row items-center justify-center rounded-full border border-blue-300 bg-blue-50/60 px-4 active:opacity-75 dark:border-sky-800 dark:bg-sky-950/20 ${
          isPendingValueEmpty ? 'opacity-50' : ''
        }`}
      >
        <Plus color="#2563eb" size={17} strokeWidth={2.6} />
        <Text className="ml-1.5 font-semibold text-[#2563eb] dark:text-[#38bdf8]">{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}
