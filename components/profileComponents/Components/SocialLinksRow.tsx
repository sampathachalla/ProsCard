// components/profileComponents/Components/SocialLinksRow.tsx
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Link2, AtSign, Camera, GitFork, Briefcase, MessageCircle, Play, type LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import type { SocialLinks } from '../types/profile.types';

const SOCIAL_ICONS: Record<keyof SocialLinks, { icon: LucideIcon; label: string }> = {
  linkedin: { icon: Link2, label: 'LinkedIn' },
  x: { icon: AtSign, label: 'X' },
  instagram: { icon: Camera, label: 'Instagram' },
  facebook: { icon: AtSign, label: 'Facebook' },
  github: { icon: GitFork, label: 'GitHub' },
  portfolio: { icon: Briefcase, label: 'Portfolio' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
  youtube: { icon: Play, label: 'YouTube' },
  tiktok: { icon: Play, label: 'TikTok' },
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
        const { icon: Icon, label } = item;
        return (
          <TouchableOpacity
            key={key}
            className="items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3"
            onPress={() => {
              Linking.openURL(url).catch(() => {});
            }}
            accessibilityLabel={label}
          >
            <Icon color={Colors.light.tint} size={20} strokeWidth={2.2} />
            <Text className="text-textMuted dark:text-dark-textMuted text-xs mt-1">{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
