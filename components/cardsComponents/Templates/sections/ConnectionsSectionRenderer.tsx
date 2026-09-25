import React from 'react';
import { Linking, Pressable, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailField, CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import { formatDisplayValue, resolveActionUrl } from './SectionSharedComponents';
import { getGradientContrastPalette } from '@/utils/cardThemeColor';

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

type ConnectionPresentation = {
  primary: string;
};

const SOCIAL_NAMES: Record<string, string> = {
  facebook: 'Facebook',
  github: 'GitHub',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  x: 'X',
  youtube: 'YouTube',
};

function isEmail(field: CardDetailField) {
  return field.type === 'email' || field.id.toLowerCase().includes('email');
}

function isPhone(field: CardDetailField) {
  const id = field.id.toLowerCase();
  return field.type === 'phone' || id.includes('phone') || id.includes('mobile');
}

function getConnectionPresentation(
  field: CardDetailField,
  showEmpty: boolean,
): ConnectionPresentation {
  const id = field.id.toLowerCase();
  const displayValue = formatDisplayValue(field) || (showEmpty ? 'Not added' : '');
  const socialName = Object.entries(SOCIAL_NAMES).find(([key]) => id.includes(key))?.[1];

  if (socialName) {
    return { primary: `Connect with me on ${socialName}` };
  }

  return { primary: displayValue };
}

type FontAwesome6Name = React.ComponentProps<typeof FontAwesome6>['name'];

function getConnectionIconName(field: CardDetailField): FontAwesome6Name {
  const id = field.id.toLowerCase();
  if (id.includes('linkedin')) return 'linkedin-in';
  if (id === 'x' || id.includes('twitter')) return 'x-twitter';
  if (id.includes('github')) return 'github';
  if (id.includes('instagram')) return 'instagram';
  if (id.includes('whatsapp')) return 'whatsapp';
  if (id.includes('youtube')) return 'youtube';
  if (id.includes('facebook')) return 'facebook-f';
  if (id.includes('tiktok')) return 'tiktok';
  if (isEmail(field)) return 'envelope';
  if (isPhone(field)) return 'phone';
  if (id.includes('address') || id.includes('location')) return 'location-dot';
  if (id.includes('portfolio')) return 'briefcase';
  if (id.includes('website') || field.type === 'url') return 'globe';
  return 'link';
}

function ConnectionIcon({ color, field, size }: { color: string; field: CardDetailField; size: number }) {
  return <FontAwesome6 color={color} name={getConnectionIconName(field)} size={size} />;
}

export function ConnectionsSectionRenderer({
  compact = false,
  cardTheme,
  gradient,
  section,
  seamless = false,
  showEmpty = false,
}: Props) {
  const boxed = compact && !seamless;
  const { width } = useWindowDimensions();
  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);
  const gradientContrast = getGradientContrastPalette(gradient);
  const rawFields = showEmpty
    ? section.fields
    : section.fields.filter((field) => field.value && field.value.trim().length > 0);
  const fields = compact ? rawFields.slice(0, 4) : rawFields;
  const useTwoColumns = compact || width >= 600;

  if (!fields.length) return null;

  const handlePress = (field: CardDetailField) => {
    const url = resolveActionUrl(field);
    if (!url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL(url).catch(() => {});
  };

  const renderCopy = (
    presentation: ConnectionPresentation,
    color: string,
    align: 'left' | 'center' = 'left',
  ) => (
    <View className="min-w-0 flex-1">
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={compact ? 1 : 2}
        className={compact ? 'text-[11px] font-bold' : 'text-sm font-bold'}
        style={{ color, fontFamily, letterSpacing, textAlign: align }}
      >
        {presentation.primary}
      </Text>
    </View>
  );

  // Quick Grid: compact square targets arranged as a responsive bento grid.
  if (section.templateId === 'minimal') {
    return (
      <View
        className={`flex-row flex-wrap gap-2 overflow-hidden p-3 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{
          backgroundColor: cardTheme.backgroundColor,
          borderColor: boxed ? cardTheme.accentColor : undefined,
          height: compact ? '100%' : undefined,
        }}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="items-center justify-center border p-3 active:opacity-70"
              style={{
                backgroundColor: cardTheme.surfaceColor,
                borderColor: cardTheme.accentColor,
                borderRadius: 10,
                minHeight: compact ? 62 : 94,
                width: useTwoColumns ? '48.5%' : '100%',
              }}
            >
              <ConnectionIcon color={cardTheme.accentColor} field={field} size={compact ? 17 : 22} />
              <View className="mt-2 w-full">
                {renderCopy(presentation, cardTheme.textColor, 'center')}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Gradient Cards: high-emphasis action rows over the selected gradient.
  if (section.templateId === 'bold') {
    return (
      <LinearGradient
        colors={gradient}
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] shadow-lg' : ''}`}
        style={{ height: compact ? '100%' : undefined }}
      >
        <View className="gap-2">
          {fields.map((field) => {
            const presentation = getConnectionPresentation(field, showEmpty);
            return (
              <Pressable
                key={field.id}
                disabled={!resolveActionUrl(field)}
                onPress={() => handlePress(field)}
                className="flex-row items-center border px-3 py-2.5 active:opacity-70"
                style={{ borderColor: gradientContrast.secondary, borderRadius: 8 }}
              >
                <View className="mr-3 h-9 w-9 items-center justify-center" style={{ backgroundColor: cardTheme.surfaceColor, borderRadius: 8 }}>
                  <ConnectionIcon color={cardTheme.accentColor} field={field} size={18} />
                </View>
                {renderCopy(presentation, gradientContrast.primary)}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>
    );
  }

  // Frosted Dock: icon-forward tiles on a raised styling surface.
  if (section.templateId === 'glass') {
    return (
      <View
        className={`flex-row flex-wrap gap-2.5 overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{
          backgroundColor: cardTheme.backgroundColor,
          borderColor: boxed ? cardTheme.mutedTextColor : undefined,
          height: compact ? '100%' : undefined,
        }}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="overflow-hidden border active:opacity-70"
              style={{
                backgroundColor: cardTheme.surfaceColor,
                borderColor: cardTheme.mutedTextColor,
                borderRadius: 18,
                width: useTwoColumns ? '48%' : '100%',
              }}
            >
              <LinearGradient colors={gradient} style={{ height: 5, width: '100%' }} />
              <View className="items-center px-3 py-3">
                <View className="mb-2 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: cardTheme.backgroundColor }}>
                  <ConnectionIcon color={cardTheme.accentColor} field={field} size={19} />
                </View>
                {renderCopy(presentation, cardTheme.textColor, 'center')}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Action Tiles: clean directory rows inspired by a native contact card.
  return (
    <View
      className={`overflow-hidden px-4 py-2 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
      style={{
        backgroundColor: cardTheme.surfaceColor,
        borderColor: boxed ? cardTheme.accentColor : undefined,
        height: compact ? '100%' : undefined,
      }}
    >
      {fields.map((field, index) => {
        const presentation = getConnectionPresentation(field, showEmpty);
        return (
          <Pressable
            key={field.id}
            disabled={!resolveActionUrl(field)}
            onPress={() => handlePress(field)}
            className="flex-row items-center py-3 active:opacity-70"
            style={{ borderBottomColor: cardTheme.mutedTextColor, borderBottomWidth: index === fields.length - 1 ? 0 : 1 }}
          >
            <View
              className="mr-4 items-center justify-center rounded-full"
              style={{ backgroundColor: cardTheme.accentColor, height: compact ? 38 : 52, width: compact ? 38 : 52 }}
            >
              <ConnectionIcon color={cardTheme.backgroundColor} field={field} size={compact ? 18 : 23} />
            </View>
            {renderCopy(presentation, cardTheme.textColor)}
          </Pressable>
        );
      })}
    </View>
  );
}
