import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Building2, Mail, Phone, type LucideIcon } from 'lucide-react-native';
import mindProsLogo from '@/assets/mindpros-logo.png';
import type { BusinessCard } from '../types/card.types';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { QRCodeView } from '@/components/uiComponents/QRCodeView';
import { Text } from '@/components/uiComponents/Text';

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-slate-200 bg-card px-4 py-3 dark:border-slate-700 dark:bg-dark-card">
      <View className="mr-3 rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
        <Icon color="#3b82f6" size={18} strokeWidth={2.2} />
      </View>
      <View className="min-w-0 flex-1">
        <Text variant="caption" className="text-textMuted dark:text-dark-textMuted">
          {label}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 font-semibold text-textPrimary dark:text-dark-textPrimary">
          {value}
        </Text>
      </View>
    </View>
  );
}

export function CardDetailView({ card }: { card: BusinessCard }) {
  return (
    <View>
      <LinearGradient
        colors={card.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mb-5 overflow-hidden rounded-[28px] p-5"
      >
        <View className="flex-row items-start justify-between">
          <BrandLogo
            accessibilityLabel="MindPROS company logo"
            size="sm"
            source={mindProsLogo}
            variant="wordmark"
          />
          <View className="rounded-full bg-slate-950/35 px-3 py-2">
            <Text className="font-bold text-white">{card.category}</Text>
          </View>
        </View>

        <View className="items-center py-8">
          <QRCodeView
            backgroundColor="#ffffff"
            foregroundColor="#0f172a"
            size={180}
            value={`https://proscard.app/card/${card.id}`}
          />
        </View>

        <Text className="text-2xl font-black text-white">{card.name}</Text>
        <Text className="mt-1 text-base font-semibold text-white/90">{card.title}</Text>
      </LinearGradient>

      <DetailRow icon={Building2} label="Company" value={card.company} />
      <DetailRow icon={Briefcase} label="Role" value={card.title} />
      <DetailRow icon={Phone} label="Phone" value={card.phone} />
      <DetailRow icon={Mail} label="Email" value={card.email} />
    </View>
  );
}
