// components/authComponents/Components/RoleSelector.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { UserRole } from '../types/auth.types';

const ROLES: UserRole[] = ['Trainer', 'Member'];

export function RoleSelector({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
      {ROLES.map((role) => (
        <TouchableOpacity
          key={role}
          onPress={() => onChange(role)}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: value === role ? Colors.light.tint : Colors.light.border,
            backgroundColor: value === role ? Colors.light.tint : Colors.light.background,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: value === role ? Colors.palette.primaryWhite : Colors.light.text,
              fontWeight: '600',
            }}
          >
            {role}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
