import { Linking, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { AtSign, ExternalLink, ImageIcon, Mail, MapPin, Phone, Type, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailField as CardDetailFieldData } from '../Templates/cardDetailTemplate';

const TYPE_ICONS: Record<CardDetailFieldData['type'], LucideIcon> = {
  text: Type,
  image: ImageIcon,
  multiline: Type,
  email: Mail,
  phone: Phone,
  url: ExternalLink,
};

function actionUrl(field: CardDetailFieldData): string | null {
  if (field.type === 'email') return `mailto:${field.value}`;
  if (field.type === 'phone') return `tel:${field.value}`;
  if (field.type === 'url') return field.value;
  return null;
}

export function CardDetailField({ field }: { field: CardDetailFieldData }) {
  const Icon = field.id === 'address' ? MapPin : field.id === 'x' ? AtSign : TYPE_ICONS[field.type];
  const url = actionUrl(field);

  if (field.type === 'image') {
    return (
      <View className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card">
        {field.value ? (
          <Image source={{ uri: field.value }} style={{ width: '100%', height: field.id === 'coverPhoto' ? 150 : 110 }} contentFit={field.id === 'logo' ? 'contain' : 'cover'} />
        ) : (
          <View className="h-24 items-center justify-center bg-slate-100 dark:bg-slate-800">
            <ImageIcon color="#94a3b8" size={24} />
          </View>
        )}
        <Text variant="caption" className="px-4 py-2 text-textMuted dark:text-dark-textMuted">{field.title}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      className="mb-3 flex-row items-start rounded-2xl border border-slate-200 bg-card px-4 py-3 dark:border-slate-700 dark:bg-dark-card"
      disabled={!url}
      onPress={url ? () => Linking.openURL(url).catch(() => {}) : undefined}
    >
      <View className="mr-3 rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
        <Icon color="#3b82f6" size={18} strokeWidth={2.2} />
      </View>
      <View className="min-w-0 flex-1">
        <Text variant="caption" className="text-textMuted dark:text-dark-textMuted">{field.title}</Text>
        <Text className="mt-0.5 text-textPrimary dark:text-dark-textPrimary">{field.value || 'Not added'}</Text>
      </View>
    </TouchableOpacity>
  );
}
