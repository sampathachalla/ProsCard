// pages/profile/Components/SocialLinksRow.tsx
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { SocialMediaIcon } from '@/common/ui/SocialMediaIcon';
import { Colors } from '@/constants/Colors';
import type { SocialLinks } from '../types/profile.types';

const SOCIAL_ICONS: Record<keyof SocialLinks, { label: string }> = {
  linkedin: { label: 'LinkedIn' },
  x: { label: 'X' },
  instagram: { label: 'Instagram' },
  facebook: { label: 'Facebook' },
  github: { label: 'GitHub' },
  portfolio: { label: 'Portfolio' },
  whatsapp: { label: 'WhatsApp' },
  youtube: { label: 'YouTube' },
  tiktok: { label: 'TikTok' },
};

export function SocialLinksRow({ social }: { social: SocialLinks }) {
  const activeLinks = (Object.keys(social) as (keyof SocialLinks)[]).filter((key) => Boolean(social[key]));

  if (activeLinks.length === 0) return null;

  return (
    <View className="flex-row flex-wrap justify-center mb-3" style={{ gap: 12 }}>
      {activeLinks.map((key) => {
        const item = SOCIAL_ICONS[key];
        const url = social[key];
        if (!item || !url) return null;
        const { label } = item;
        return (
          <TouchableOpacity
            key={key}
            className="items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3"
            onPress={() => {
              Linking.openURL(url).catch(() => {});
            }}
            accessibilityLabel={label}
          >
            {key === 'portfolio' ? (
              <Briefcase color={Colors.light.tint} size={20} strokeWidth={2.2} />
            ) : (
              <SocialMediaIcon color={Colors.light.tint} platform={key} size={20} />
            )}
            <Text className="text-textMuted dark:text-dark-textMuted text-xs mt-1">{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
