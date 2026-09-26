import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import {
  AtSign,
  Award,
  Briefcase,
  Building2,
  Camera,
  ExternalLink,
  FileText,
  GitFork,
  Globe,
  ImageIcon,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Play,
  Phone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import mindProsLogoDark from '@/assets/mindpros-logo-dark.png';
import mindProsLogoLight from '@/assets/mindpros-logo-light.png';
import type { CardDetailField } from '../cardDetailTemplate';
import type { CardTemplateId, CardVisualTheme, ResolvedLayoutSlots } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import {
  type LogoPlacementContext,
  isRgbaOrHexLight,
  resolveLogoBoxStyle,
} from '@/utils/cardThemeColor';

export function resolveActionUrl(field: CardDetailField): string | null {
  if (!field.value || !field.value.trim()) return null;
  const val = field.value.trim();
  if (field.type === 'email' || field.id === 'email') return `mailto:${val}`;
  if (field.type === 'phone' || field.id === 'phone') return `tel:${val}`;
  if (field.id === 'whatsapp') {
    const cleanNumber = val.replace(/[^0-9]/g, '');
    return cleanNumber ? `https://wa.me/${cleanNumber}` : null;
  }
  if (
    field.type === 'url' ||
    field.id === 'website' ||
    field.id === 'linkedin' ||
    field.id === 'facebook' ||
    field.id === 'x' ||
    field.id === 'instagram' ||
    field.id === 'github' ||
    field.id === 'portfolio' ||
    field.id === 'youtube' ||
    field.id === 'tiktok'
  ) {
    return val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
  }
  return null;
}

export function formatDisplayValue(field: CardDetailField): string {
  if (!field.value) return '';
  let str = field.value.trim();
  str = str.replace(/^https?:\/\/(www\.)?/, '');
  str = str.replace(/^mailto:/, '');
  str = str.replace(/^tel:/, '');
  return str.endsWith('/') ? str.slice(0, -1) : str;
}

export function getFieldIcon(fieldId: string, fieldType?: string): LucideIcon {
  const normalized = fieldId.toLowerCase();
  if (normalized.includes('email') || fieldType === 'email') return Mail;
  if (
    normalized.includes('phone') ||
    normalized.includes('mobile') ||
    normalized.includes('tel') ||
    fieldType === 'phone'
  )
    return Phone;
  if (normalized.includes('address') || normalized.includes('location')) return MapPin;
  if (normalized.includes('website') || normalized.includes('site') || normalized.includes('web'))
    return Globe;
  if (normalized.includes('linkedin')) return Link2;
  if (normalized.includes('x') || normalized.includes('twitter')) return AtSign;
  if (normalized.includes('instagram')) return Camera;
  if (normalized.includes('github')) return GitFork;
  if (normalized.includes('youtube') || normalized.includes('tiktok')) return Play;
  if (normalized.includes('whatsapp')) return MessageCircle;
  if (normalized.includes('portfolio')) return FileText;
  if (normalized.includes('company') || normalized.includes('org')) return Building2;
  if (normalized.includes('title') || normalized.includes('job') || normalized.includes('role'))
    return Briefcase;
  if (normalized.includes('accreditation') || normalized.includes('cert')) return Award;
  return ExternalLink;
}

export function IdentityImage({
  field,
  fit = 'cover',
  iconColor = '#94a3b8',
  placeholderColor = '#1e293b',
  style,
}: {
  field?: CardDetailField;
  fit?: 'contain' | 'cover';
  iconColor?: string;
  placeholderColor?: string;
  style: object;
}) {
  if (!field?.value) {
    return (
      <View style={[style, { backgroundColor: placeholderColor }]} className="items-center justify-center">
        <ImageIcon color={iconColor} size={22} />
      </View>
    );
  }
  return <Image source={{ uri: field.value }} contentFit={fit} style={style} />;
}

export function UniversalLogoBadge({
  backdropColor,
  borderColor,
  cardTheme,
  compact = false,
  field,
  placement,
  slots,
  style,
  templateId,
}: {
  backdropColor?: string;
  borderColor?: string;
  cardTheme?: CardVisualTheme;
  compact?: boolean;
  field?: CardDetailField;
  placement?: LogoPlacementContext;
  slots?: ResolvedLayoutSlots;
  style?: object;
  templateId?: CardTemplateId;
}) {
  const logoWidth = compact ? 80 : 128;
  const logoHeight = compact ? 30 : 48;

  const engineStyle = resolveLogoBoxStyle({
    compact,
    placement,
    slots,
    templateId,
    theme: cardTheme,
  });

  const effectiveBg = backdropColor || engineStyle.backgroundColor;
  const isBackdropLight = isRgbaOrHexLight(effectiveBg);

  const defaultBrandLogo = isBackdropLight ? mindProsLogoLight : mindProsLogoDark;

  const resolvedSource =
    field?.value && typeof field.value === 'string' && field.value.startsWith('http')
      ? { uri: field.value }
      : field?.value && typeof field.value === 'string' && field.value.length > 0
        ? { uri: field.value }
        : defaultBrandLogo;

  return (
    <View
      style={[
        {
          alignItems: 'center',
          backgroundColor: effectiveBg,
          borderColor: borderColor || engineStyle.borderColor,
          borderRadius: engineStyle.borderRadius,
          borderWidth: engineStyle.borderWidth,
          height: logoHeight + (compact ? 8 : 12),
          justifyContent: 'center',
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 4 : 6,
          shadowColor: engineStyle.shadowColor,
          shadowOffset: engineStyle.shadowOffset,
          shadowOpacity: engineStyle.shadowOpacity,
          shadowRadius: engineStyle.shadowRadius,
          elevation: engineStyle.elevation,
          width: logoWidth + (compact ? 14 : 22),
        },
        style,
      ]}
    >
      <Image
        source={resolvedSource}
        contentFit="contain"
        style={{ width: logoWidth, height: logoHeight }}
      />
    </View>
  );
}

export function AccreditationPills({
  accreditations,
  cardTheme,
  compact = false,
  light = false,
}: {
  accreditations?: string;
  cardTheme: CardVisualTheme;
  compact?: boolean;
  light?: boolean;
}) {
  if (!accreditations || !accreditations.trim()) return null;
  const items = accreditations
    .split(/[,|•;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) return null;

  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <View
          key={idx}
          className="flex-row items-center rounded-full px-2.5 py-0.5"
          style={{
            backgroundColor: light ? 'rgba(255, 255, 255, 0.22)' : `${cardTheme.accentColor}18`,
            borderColor: light ? 'rgba(255, 255, 255, 0.4)' : `${cardTheme.accentColor}44`,
            borderWidth: 1,
          }}
        >
          <Award color={light ? '#ffffff' : cardTheme.accentColor} size={compact ? 10 : 12} />
          <Text
            className={`ml-1 font-bold ${compact ? 'text-[9px]' : 'text-[11px]'}`}
            style={{
              color: light ? '#ffffff' : cardTheme.textColor,
              fontFamily,
              letterSpacing,
            }}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function SectionHeaderBadge({
  icon: Icon,
  title,
  cardTheme,
  light = false,
  badgeText,
}: {
  icon?: LucideIcon;
  title: string;
  cardTheme: CardVisualTheme;
  light?: boolean;
  badgeText?: string;
}) {
  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);

  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center">
        {Icon ? (
          <View
            className="mr-2 h-6 w-6 items-center justify-center rounded-lg shadow-sm"
            style={{
              backgroundColor: light ? 'rgba(255, 255, 255, 0.2)' : `${cardTheme.accentColor}20`,
            }}
          >
            <Icon color={light ? '#ffffff' : cardTheme.accentColor} size={13} />
          </View>
        ) : null}
        <Text
          className="text-[11px] font-extrabold uppercase tracking-wider"
          style={{
            color: light ? 'rgba(255, 255, 255, 0.85)' : cardTheme.mutedTextColor,
            fontFamily,
            letterSpacing,
          }}
        >
          {title}
        </Text>
      </View>
      {badgeText ? (
        <View
          className="flex-row items-center rounded-full px-2.5 py-0.5"
          style={{
            backgroundColor: light ? 'rgba(255, 255, 255, 0.18)' : `${cardTheme.accentColor}15`,
            borderColor: light ? 'rgba(255, 255, 255, 0.3)' : `${cardTheme.accentColor}30`,
            borderWidth: 1,
          }}
        >
          <Sparkles color={light ? '#ffffff' : cardTheme.accentColor} size={10} />
          <Text
            className="ml-1 text-[10px] font-bold"
            style={{
              color: light ? '#ffffff' : cardTheme.accentColor,
              fontFamily,
              letterSpacing,
            }}
          >
            {badgeText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
