import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/uiComponents/Text';
import type { UserRole } from '../types/auth.types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'Member', label: 'Personal' },
  { value: 'Trainer', label: 'Work' },
];

/** Compact Canva/Instagram segmented control — not card-heavy. */
export function RoleSelector({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <View className="mb-4 flex-row rounded-xl bg-black/[0.04] p-1 dark:bg-white/10">
      {ROLES.map((role) => {
        const selected = value === role.value;
        return (
          <Pressable
            key={role.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(role.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={role.label}
            className={`flex-1 items-center rounded-lg py-2.5 active:opacity-80 ${
              selected ? 'bg-white shadow-sm dark:bg-slate-800' : ''
            }`}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selected
                  ? 'text-textPrimary dark:text-dark-textPrimary'
                  : 'text-[#8e8e8e] dark:text-slate-400'
              }`}
            >
              {role.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
