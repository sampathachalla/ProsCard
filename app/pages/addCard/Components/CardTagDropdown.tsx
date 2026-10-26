import { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Briefcase, Check, ChevronDown, FolderKanban, Network, Tag, UserRound, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { CARD_TAG_OPTIONS } from '@/pages/cards/types/card.types';

const TAG_ICONS: Record<string, LucideIcon> = {
  Business: Briefcase,
  Personal: UserRound,
  Networking: Network,
  Portfolio: FolderKanban,
};

type Props = {
  value: string;
  onChange: (tag: string) => void;
};

/** Pill-shaped select for the required card tag; options expand inline below it. */
export function CardTagDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const SelectedIcon = TAG_ICONS[value] ?? Tag;

  const choose = (tag: string) => {
    Haptics.selectionAsync().catch(() => {});
    onChange(tag);
    setOpen(false);
  };

  return (
    <View className="mb-3">
      <Pressable
        accessibilityLabel="Card tag"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        className="min-h-[52px] flex-row items-center rounded-full border border-slate-200 bg-card px-5 active:opacity-80 dark:border-slate-800 dark:bg-dark-card"
      >
        <SelectedIcon color={value ? '#2563eb' : '#94a3b8'} size={18} strokeWidth={2.2} />
        <View className="ml-3 flex-1">
          <Text variant="tiny">Card tag *</Text>
          <Text
            variant="none"
            className={`text-base font-semibold ${value ? 'text-textPrimary dark:text-dark-textPrimary' : 'text-slate-400'}`}
          >
            {value || 'Choose a tag'}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <ChevronDown color="#64748b" size={20} strokeWidth={2.4} />
        </View>
      </Pressable>

      {open ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-card dark:border-slate-800 dark:bg-dark-card">
          {CARD_TAG_OPTIONS.map((tag, index) => {
            const Icon = TAG_ICONS[tag] ?? Tag;
            const selected = tag === value;
            return (
              <Pressable
                key={tag}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => choose(tag)}
                className={`min-h-[48px] flex-row items-center px-5 active:bg-slate-100 dark:active:bg-slate-800 ${
                  index > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''
                }`}
              >
                <Icon color={selected ? '#2563eb' : '#64748b'} size={18} strokeWidth={2.2} />
                <Text className="ml-3 flex-1 font-semibold">{tag}</Text>
                {selected ? <Check color="#2563eb" size={18} strokeWidth={2.6} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
