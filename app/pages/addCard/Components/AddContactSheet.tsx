import { Pressable, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { getFieldIcon } from '@/pages/cards/Templates/sections/SectionSharedComponents';
import type { DynamicCardField } from '@/pages/cards/types/card.types';
import { CONTACT_OPTIONS } from '../Config/addCardFields';
import type { ContactOption } from '../types/addCard.types';
import { AddCardSheet } from './AddCardSheet';

type Props = {
  existing: DynamicCardField[];
  visible: boolean;
  onClose: () => void;
  onAdd: (option: ContactOption) => void;
};

const normalize = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Lists the contact methods not yet on the card. */
export function AddContactSheet({ existing, visible, onClose, onAdd }: Props) {
  const used = new Set(existing.map((field) => normalize(field.title)));
  const options = CONTACT_OPTIONS.filter((option) => !used.has(normalize(option.title)));

  return (
    <AddCardSheet title="Add contact" visible={visible} onClose={onClose}>
      {options.length === 0 ? (
        <Text variant="muted" className="text-center">
          Every contact method is already on this card.
        </Text>
      ) : (
        <View className="overflow-hidden rounded-2xl border border-slate-200 bg-card dark:border-slate-800 dark:bg-dark-card">
          {options.map((option, index) => {
            const Icon = getFieldIcon(option.title, option.type);
            return (
              <Pressable
                key={option.title}
                accessibilityLabel={`Add ${option.title}`}
                accessibilityRole="button"
                onPress={() => onAdd(option)}
                className={`min-h-[52px] flex-row items-center px-4 active:bg-slate-100 dark:active:bg-slate-800 ${
                  index > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''
                }`}
              >
                <Icon color="#2563eb" size={18} strokeWidth={2.2} />
                <Text className="ml-3 flex-1 font-semibold">{option.title}</Text>
                <Plus color="#94a3b8" size={18} strokeWidth={2.4} />
              </Pressable>
            );
          })}
        </View>
      )}
    </AddCardSheet>
  );
}
