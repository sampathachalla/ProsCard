import { Linking, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ExternalLink, ImageIcon } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailField, CardDetailSection } from './cardDetailTemplate';
import type { CardVisualTheme } from '../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from './cardTheme';

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  showEmpty?: boolean;
};

function href(field: CardDetailField) {
  if (!field.value) return null;
  if (field.type === 'email') return `mailto:${field.value}`;
  if (field.type === 'phone') return `tel:${field.value}`;
  if (field.type === 'url') return field.value;
  return null;
}

function Media({ cardTheme, field, compact, rounded = false }: { cardTheme: CardVisualTheme; field: CardDetailField; compact: boolean; rounded?: boolean }) {
  const height = compact ? 72 : field.id === 'coverPhoto' ? 150 : 108;
  if (!field.value) {
    return <View className="items-center justify-center border" style={{ height, borderRadius: rounded ? height / 2 : 16, backgroundColor: cardTheme.backgroundColor, borderColor: cardTheme.accentColor }}><ImageIcon color={cardTheme.mutedTextColor} size={22} /></View>;
  }
  return <Image source={{ uri: field.value }} contentFit={field.id === 'logo' ? 'contain' : 'cover'} style={{ height, width: '100%', borderRadius: rounded ? height / 2 : 16, borderColor: cardTheme.accentColor, borderWidth: 1 }} />;
}

function Value({ cardTheme, field, light = false, minimal = false }: { cardTheme: CardVisualTheme; field: CardDetailField; light?: boolean; minimal?: boolean }) {
  const url = href(field);
  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);
  return (
    <Pressable disabled={!url} onPress={url ? () => Linking.openURL(url).catch(() => {}) : undefined}>
      <Text style={{ color: light ? 'rgba(255,255,255,0.7)' : cardTheme.mutedTextColor, fontFamily, letterSpacing }} className="text-[10px] font-bold uppercase">{field.title}</Text>
      <View className="mt-1 flex-row items-center">
        <Text numberOfLines={minimal ? 2 : 3} style={{ color: light ? '#ffffff' : cardTheme.textColor, fontFamily, letterSpacing }} className={`flex-1 ${minimal ? 'text-base font-semibold' : 'text-sm'}`}>{field.value || 'Not added'}</Text>
        {url ? <ExternalLink color={light ? '#ffffff' : '#3b82f6'} size={14} /> : null}
      </View>
    </Pressable>
  );
}

function visibleFields(section: CardDetailSection, compact: boolean, showEmpty: boolean) {
  const fields = showEmpty ? section.fields : section.fields.filter((field) => field.value.trim());
  if (!compact) return fields;
  const priority: Record<CardDetailSection['id'], string[]> = {
    identity: ['coverPhoto', 'profilePhoto', 'logo', 'preferredName'],
    professional: ['tagline', 'accreditations', 'firstName', 'lastName', 'title', 'company'],
    bio: ['bio'],
    connections: ['email', 'phone', 'website', 'linkedin'],
  };
  return fields.filter((field) => priority[section.id].includes(field.id)).slice(0, 6);
}

function IdentityImage({ field, fit = 'cover', style }: { field?: CardDetailField; fit?: 'contain' | 'cover'; style: object }) {
  if (!field?.value) return <View style={[style, { backgroundColor: '#1e293b' }]} className="items-center justify-center"><ImageIcon color="#94a3b8" size={22} /></View>;
  return <Image source={{ uri: field.value }} contentFit={fit} style={style} />;
}

function IdentitySection({ cardTheme, compact, gradient, section }: { cardTheme: CardVisualTheme; compact: boolean; gradient: [string, string]; section: CardDetailSection }) {
  const field = (id: string) => section.fields.find((item) => item.id === id);
  const cover = field('coverPhoto');
  const profile = field('profilePhoto');
  const logo = field('logo');
  const name = field('preferredName')?.value || 'Preferred name';
  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);
  const profileSize = compact ? 58 : 92;
  const logoWidth = compact ? 82 : 126;
  const logoHeight = compact ? 36 : 52;
  const shellStyle = {
    backgroundColor: cardTheme.surfaceColor,
    borderColor: cardTheme.accentColor,
    height: compact ? '100%' as const : undefined,
    minHeight: compact ? undefined : 280,
  };
  const nameStyle = { color: cardTheme.textColor, fontFamily, letterSpacing };

  if (section.templateId === 'minimal') {
    return (
      <View className="mb-5 flex-row overflow-hidden rounded-[24px] border" style={shellStyle}>
        <View className="relative w-[42%] overflow-hidden" style={{ backgroundColor: cardTheme.backgroundColor }}>
          <IdentityImage field={cover} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: `${cardTheme.backgroundColor}55` }]} />
          <View className="flex-1 items-center justify-center">
            <IdentityImage field={profile} style={{ width: profileSize, height: profileSize, borderRadius: profileSize / 2, borderWidth: 3, borderColor: cardTheme.accentColor }} />
          </View>
        </View>
        <View className="flex-1 justify-between p-4">
          <IdentityImage field={logo} fit="contain" style={{ width: logoWidth, height: logoHeight, alignSelf: 'flex-end' }} />
          <View>
            <Text className={compact ? 'text-[10px] font-bold uppercase' : 'text-xs font-bold uppercase'} style={{ color: cardTheme.mutedTextColor, fontFamily, letterSpacing }}>Identity</Text>
            <Text numberOfLines={2} className={compact ? 'mt-1 text-lg font-black' : 'mt-2 text-2xl font-black'} style={nameStyle}>{name}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (section.templateId === 'bold') {
    return (
      <View className="relative mb-5 overflow-hidden rounded-[24px] border" style={shellStyle}>
        <IdentityImage field={cover} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={[`${gradient[0]}55`, `${gradient[1]}EE`]} style={StyleSheet.absoluteFill} />
        <View className="flex-1 justify-between p-4">
          <IdentityImage field={logo} fit="contain" style={{ width: logoWidth, height: logoHeight, alignSelf: 'flex-end' }} />
          <View className="flex-row items-end">
            <IdentityImage field={profile} style={{ width: profileSize, height: profileSize, borderRadius: 18, borderWidth: 3, borderColor: '#ffffff' }} />
            <View className="ml-3 flex-1">
              <Text className="text-[10px] font-bold uppercase text-white/70" style={{ fontFamily, letterSpacing }}>Identity</Text>
              <Text numberOfLines={2} className={compact ? 'mt-1 text-lg font-black text-white' : 'mt-1 text-3xl font-black text-white'} style={{ fontFamily, letterSpacing }}>{name}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (section.templateId === 'glass') {
    return (
      <LinearGradient colors={[gradient[0], gradient[1]]} className="relative mb-5 overflow-hidden rounded-[24px] border" style={shellStyle}>
        <IdentityImage field={cover} style={{ width: '100%', height: compact ? '52%' : 155 }} />
        <View className="absolute inset-x-4 bottom-4 items-center rounded-[22px] border border-white/30 bg-black/35 p-3">
          <IdentityImage field={profile} style={{ width: profileSize, height: profileSize, marginTop: compact ? -40 : -58, borderRadius: profileSize / 2, borderWidth: 3, borderColor: '#ffffff' }} />
          <IdentityImage field={logo} fit="contain" style={{ width: logoWidth, height: logoHeight, marginTop: 4 }} />
          <Text numberOfLines={1} className={compact ? 'mt-1 text-base font-black text-white' : 'mt-2 text-2xl font-black text-white'} style={{ fontFamily, letterSpacing }}>{name}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View className="relative mb-5 overflow-hidden rounded-[24px] border" style={shellStyle}>
      <IdentityImage field={cover} style={{ width: '100%', height: compact ? '58%' : 175 }} />
      <View className="absolute left-4 top-4 rounded-xl bg-black/35 px-2">
        <IdentityImage field={logo} fit="contain" style={{ width: logoWidth, height: logoHeight }} />
      </View>
      <View className="flex-1 flex-row items-center px-4 pb-3">
        <IdentityImage field={profile} style={{ width: profileSize, height: profileSize, marginTop: compact ? -24 : -42, borderRadius: profileSize / 2, borderWidth: 3, borderColor: cardTheme.surfaceColor }} />
        <View className="ml-3 flex-1">
          <Text className="text-[10px] font-bold uppercase" style={{ color: cardTheme.mutedTextColor, fontFamily, letterSpacing }}>Identity</Text>
          <Text numberOfLines={2} className={compact ? 'mt-1 text-lg font-black' : 'mt-1 text-2xl font-black'} style={nameStyle}>{name}</Text>
        </View>
      </View>
    </View>
  );
}

export function SectionTemplateRenderer({ compact = false, cardTheme, gradient, section, showEmpty = false }: Props) {
  const { width } = useWindowDimensions();
  const fields = visibleFields(section, compact, showEmpty);
  const wide = !compact && width >= 600;
  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);
  if (!fields.length) return null;

  if (section.id === 'identity') {
    return <IdentitySection cardTheme={cardTheme} compact={compact} gradient={gradient} section={section} />;
  }

  const renderField = (field: CardDetailField, light = false, minimal = false) => (
    <View key={field.id} style={{ width: wide ? '48%' : '100%' }} className="mb-3">
      {field.type === 'image' ? <Media cardTheme={cardTheme} field={field} compact={compact} rounded={minimal && field.id === 'profilePhoto'} /> : <Value cardTheme={cardTheme} field={field} light={light} minimal={minimal} />}
    </View>
  );

  if (section.templateId === 'minimal') {
    return (
      <View className="mb-5 border-l-2 px-4 py-2" style={{ backgroundColor: cardTheme.backgroundColor, borderColor: cardTheme.accentColor }}>
        <Text className="mb-4 text-lg font-black" style={{ color: cardTheme.textColor, fontFamily, letterSpacing }}>{section.title}</Text>
        <View className="flex-row flex-wrap justify-between">{fields.map((field) => renderField(field, false, true))}</View>
      </View>
    );
  }

  if (section.templateId === 'bold') {
    return (
      <LinearGradient colors={gradient} className="mb-5 overflow-hidden rounded-[28px] p-4">
        <Text className="mb-4 text-lg font-black text-white" style={{ fontFamily, letterSpacing }}>{section.title}</Text>
        <View className="flex-row flex-wrap justify-between">
          {fields.map((field) => (
            <View key={field.id} style={{ width: wide ? '48%' : '100%' }} className="mb-3 rounded-2xl bg-black/20 p-3">
              {field.type === 'image' ? <Media cardTheme={cardTheme} field={field} compact={compact} /> : <Value cardTheme={cardTheme} field={field} light />}
            </View>
          ))}
        </View>
      </LinearGradient>
    );
  }

  if (section.templateId === 'glass') {
    return (
      <LinearGradient colors={[`${gradient[0]}55`, `${gradient[1]}22`]} className="mb-5 overflow-hidden rounded-[28px] border border-white/20">
        <BlurView intensity={32} tint={cardTheme.id === 'midnight' ? 'dark' : 'light'} className="p-4">
          <Text className="mb-4 text-lg font-black" style={{ color: cardTheme.textColor, fontFamily, letterSpacing }}>{section.title}</Text>
          <View className="flex-row flex-wrap justify-between">
            {fields.map((field) => <View key={field.id} style={{ width: wide ? '48%' : '100%', backgroundColor: `${cardTheme.surfaceColor}99`, borderColor: cardTheme.accentColor }} className="mb-3 rounded-2xl border p-3">{field.type === 'image' ? <Media cardTheme={cardTheme} field={field} compact={compact} /> : <Value cardTheme={cardTheme} field={field} />}</View>)}
          </View>
        </BlurView>
      </LinearGradient>
    );
  }

  return (
    <View className="mb-5 rounded-[24px] border p-4" style={{ backgroundColor: cardTheme.surfaceColor, borderColor: cardTheme.accentColor }}>
      <Text className="mb-4 text-xs font-bold uppercase" style={{ color: cardTheme.mutedTextColor, fontFamily, letterSpacing }}>{section.title}</Text>
      <View className="flex-row flex-wrap justify-between">{fields.map((field) => renderField(field))}</View>
    </View>
  );
}
