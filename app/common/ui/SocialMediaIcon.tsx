import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import type React from 'react';

type FontAwesome6Name = React.ComponentProps<typeof FontAwesome6>['name'];

const SOCIAL_ICON_NAMES: Record<string, FontAwesome6Name> = {
  bluesky: 'bluesky',
  discord: 'discord',
  facebook: 'facebook-f',
  github: 'github',
  instagram: 'instagram',
  linkedin: 'linkedin-in',
  pinterest: 'pinterest-p',
  reddit: 'reddit-alien',
  snapchat: 'snapchat',
  telegram: 'telegram',
  threads: 'threads',
  tiktok: 'tiktok',
  twitter: 'x-twitter',
  whatsapp: 'whatsapp',
  x: 'x-twitter',
  youtube: 'youtube',
};

export function getSocialMediaIconName(value: string): FontAwesome6Name | undefined {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return Object.entries(SOCIAL_ICON_NAMES).find(([key]) => normalized.includes(key))?.[1];
}

export function SocialMediaIcon({
  color,
  platform,
  size,
}: {
  color: string;
  platform: string;
  size: number;
}) {
  const name = getSocialMediaIconName(platform);
  if (!name) return null;
  return <FontAwesome6 color={color} name={name} size={size} />;
}
