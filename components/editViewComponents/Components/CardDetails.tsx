// components/editViewComponents/Components/CardDetails.tsx
import { View, Text } from 'react-native';
import { Briefcase, Building2, Mail, Phone, type LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import type { EditableCard } from '../types/editView.types';

function DetailRow({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <View className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3 mb-3">
      <Icon color={Colors.light.tint} size={18} strokeWidth={2.2} />
      <Text className="text-textPrimary dark:text-dark-textPrimary ml-3">{value}</Text>
    </View>
  );
}

export function CardDetails({ card }: { card: EditableCard }) {
  return (
    <View>
      <DetailRow icon={Building2} value={card.company} />
      <DetailRow icon={Briefcase} value={card.title} />
      <DetailRow icon={Phone} value={card.phone} />
      <DetailRow icon={Mail} value={card.email} />
    </View>
  );
}
