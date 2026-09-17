// components/editViewComponents/Components/CardDetails.tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import type { EditableCard } from '../types/editView.types';

function DetailRow({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3 mb-3">
      <Ionicons name={icon} size={18} color={Colors.light.tint} />
      <Text className="text-textPrimary dark:text-dark-textPrimary ml-3">{value}</Text>
    </View>
  );
}

export function CardDetails({ card }: { card: EditableCard }) {
  return (
    <View>
      <DetailRow icon="business-outline" value={card.company} />
      <DetailRow icon="briefcase-outline" value={card.title} />
      <DetailRow icon="call-outline" value={card.phone} />
      <DetailRow icon="mail-outline" value={card.email} />
    </View>
  );
}
