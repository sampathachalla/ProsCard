import React from 'react';
import { Linking, Pressable, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailField, CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import {
  BOXED_SHADOW_LG,
  BOXED_SHADOW_MD,
  BOXED_SHADOW_SM,
  formatDisplayValue,
  resolveActionUrl,
} from './SectionSharedComponents';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';

/** Floor only — unlike Identity/Professional/Bio, Connections legitimately
 * varies in height with the number of channels a user has added. This just
 * keeps a layout from looking near-collapsed when only 1-2 are present. */
const CONNECTIONS_MIN_HEIGHT = 110;

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

/** Directory-style presentation: a small channel label ("Email", "LinkedIn")
 * paired with the actual stored value — not a templated sentence. */
type ConnectionPresentation = {
  label: string;
  value: string;
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

function getConnectionLabel(field: CardDetailField): string {
  const id = field.id.toLowerCase();
  const socialName = Object.entries(SOCIAL_NAMES).find(([key]) => id.includes(key))?.[1];
  if (socialName) return socialName;
  if (isEmail(field)) return 'Email';
  if (isPhone(field)) return 'Phone';
  if (id.includes('address') || id.includes('location')) return 'Address';
  if (id.includes('portfolio')) return 'Portfolio';
  if (id.includes('website') || field.type === 'url') return 'Website';
  return field.title || 'Link';
}

function getConnectionPresentation(
  field: CardDetailField,
  showEmpty: boolean,
): ConnectionPresentation {
  return {
    label: getConnectionLabel(field),
    value: formatDisplayValue(field) || (showEmpty ? 'Not added' : ''),
  };
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
  const slots = resolveLayoutColorSlots({ templateId: section.templateId, theme: cardTheme });
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
    mutedColor: string,
    align: 'left' | 'center' = 'left',
  ) => (
    <View className="min-w-0 flex-1">
      <Text
        numberOfLines={1}
        className={compact ? 'text-[8px] font-bold uppercase tracking-wider' : 'text-[10px] font-bold uppercase tracking-wider'}
        style={{ color: mutedColor, fontFamily, letterSpacing, textAlign: align }}
      >
        {presentation.label}
      </Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        className={compact ? 'text-[11px] font-bold' : 'text-sm font-bold'}
        style={{ color, fontFamily, letterSpacing, textAlign: align }}
      >
        {presentation.value}
      </Text>
    </View>
  );

  // Quick Grid (minimal): compact square targets arranged as a responsive bento grid
  if (section.templateId === 'minimal') {
    return (
      <View
        className={`flex-row flex-wrap gap-2 overflow-hidden p-3 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.background,
          borderColor: boxed ? slots.accent : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_SM : null]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="items-center justify-center border p-3 active:opacity-70"
              style={{
                backgroundColor: slots.surface,
                borderColor: slots.accent,
                borderRadius: 10,
                minHeight: compact ? 62 : 94,
                width: useTwoColumns ? '48.5%' : '100%',
              }}
            >
              <ConnectionIcon color={slots.accent} field={field} size={compact ? 17 : 22} />
              <View className="mt-2 w-full">
                {renderCopy(presentation, slots.textPrimary, slots.textSecondary, 'center')}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Gradient Cards (bold): action rows over theme gradient
  if (section.templateId === 'bold') {
    const mutedOnGradient = slots.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)';
    return (
      <LinearGradient
        colors={gradient}
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px]' : ''}`}
        style={[{ height: compact ? '100%' : undefined, minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT }, boxed ? BOXED_SHADOW_LG : null]}
      >
        <View className="gap-2">
          {fields.map((field) => {
            const presentation = getConnectionPresentation(field, showEmpty);
            return (
              <Pressable
                key={field.id}
                accessibilityRole="button"
                accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                disabled={!resolveActionUrl(field)}
                onPress={() => handlePress(field)}
                className="flex-row items-center border px-3 py-2.5 active:opacity-70"
                style={{
                  backgroundColor: slots.isDark ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.25)',
                  borderColor: slots.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                  borderRadius: 10,
                }}
              >
                <View className="mr-3 h-9 w-9 items-center justify-center" style={{ backgroundColor: slots.surface, borderRadius: 8 }}>
                  <ConnectionIcon color={slots.accent} field={field} size={18} />
                </View>
                {renderCopy(presentation, slots.gradientText, mutedOnGradient)}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>
    );
  }

  // Frosted Dock (glass): icon-forward tiles with highlight accent
  if (section.templateId === 'glass') {
    return (
      <View
        className={`flex-row flex-wrap gap-2.5 overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.background,
          borderColor: boxed ? slots.highlight : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_MD : null]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="overflow-hidden border active:opacity-70"
              style={{
                backgroundColor: slots.surface,
                borderColor: slots.highlight,
                borderRadius: 18,
                width: useTwoColumns ? '48%' : '100%',
              }}
            >
              <LinearGradient colors={gradient} style={{ height: 5, width: '100%' }} />
              <View className="items-center px-3 py-3">
                <View className="mb-2 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: slots.background }}>
                  <ConnectionIcon color={slots.accent} field={field} size={19} />
                </View>
                {renderCopy(presentation, slots.textPrimary, slots.textSecondary, 'center')}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Compact Chip Flow (compact): dense tag-style overview
  if (section.templateId === 'compact') {
    return (
      <View
        className={`flex-row flex-wrap gap-2 overflow-hidden p-3 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.highlight : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_SM : null]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="min-w-0 flex-row items-center rounded-full border px-3 py-1.5 active:opacity-70"
              style={{
                backgroundColor: slots.background,
                borderColor: slots.highlight,
                width: '48.5%',
              }}
            >
              <ConnectionIcon color={slots.accent} field={field} size={14} />
              <View className="ml-2 min-w-0 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-xs font-semibold"
                  style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
                >
                  {presentation.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Magazine Directory (editorial): numbered directory rows
  if (section.templateId === 'editorial') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.highlight : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_SM : null]}
      >
        {fields.map((field, idx) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="flex-row items-center py-2.5 active:opacity-70"
              style={{
                borderBottomWidth: idx === fields.length - 1 ? 0 : 1,
                borderBottomColor: slots.borderColor,
              }}
            >
              <Text
                className="w-7 text-xs font-bold"
                style={{ color: slots.accent, fontFamily }}
              >
                0{idx + 1}
              </Text>
              <View className="mr-3 h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: `${slots.accent}18` }}>
                <ConnectionIcon color={slots.accent} field={field} size={14} />
              </View>
              {renderCopy(presentation, slots.textPrimary, slots.textSecondary)}
              <FontAwesome6 name="arrow-up-right-from-square" size={12} color={slots.textSecondary} style={{ marginLeft: 8 }} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Hero Spotlight (spotlight): featured primary channel plus supporting grid
  if (section.templateId === 'spotlight') {
    const [heroField, ...otherFields] = fields;
    const heroPresentation = heroField ? getConnectionPresentation(heroField, showEmpty) : null;

    return (
      <View
        className={`overflow-hidden p-3.5 gap-2.5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.highlight : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_MD : null]}
      >
        {heroField && heroPresentation && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${heroPresentation.label}: ${heroPresentation.value}`}
            disabled={!resolveActionUrl(heroField)}
            onPress={() => handlePress(heroField)}
            className="flex-row items-center justify-between rounded-2xl p-3.5 active:opacity-80"
            style={{ backgroundColor: slots.accent }}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <ConnectionIcon color="#FFFFFF" field={heroField} size={18} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                  {heroPresentation.label}
                </Text>
                <Text numberOfLines={1} className="text-sm font-bold text-white" style={{ fontFamily }}>
                  {heroPresentation.value}
                </Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color="#FFFFFF" />
          </Pressable>
        )}

        {otherFields.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {otherFields.map((field) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!resolveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="flex-row items-center rounded-xl border px-3 py-2 active:opacity-70"
                  style={{
                    backgroundColor: slots.background,
                    borderColor: slots.highlight,
                    width: useTwoColumns ? '48.5%' : '100%',
                  }}
                >
                  <ConnectionIcon color={slots.accent} field={field} size={15} />
                  <View className="ml-2 flex-1 min-w-0">
                    <Text numberOfLines={1} className="text-xs font-semibold" style={{ color: slots.textPrimary, fontFamily }}>
                      {presentation.value}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  // Ribbon Cards (banner): accent-striped directory rows
  if (section.templateId === 'banner') {
    return (
      <View
        className={`gap-2 overflow-hidden p-3.5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.background,
          borderColor: boxed ? slots.highlight : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_SM : null]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="flex-row items-center overflow-hidden rounded-xl border active:opacity-70"
              style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
            >
              <View style={{ width: 6, height: '100%', backgroundColor: slots.accent }} />
              <View className="flex-1 flex-row items-center px-3.5 py-3">
                <ConnectionIcon color={slots.accent} field={field} size={17} />
                <View className="ml-3 flex-1 min-w-0">
                  {renderCopy(presentation, slots.textPrimary, slots.textSecondary)}
                </View>
                <FontAwesome6 name="arrow-right" size={13} color={slots.textSecondary} />
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Floating Tiles (cards): inset bento tiles
  if (section.templateId === 'cards') {
    return (
      <View
        className={`flex-row flex-wrap gap-2.5 overflow-hidden p-3.5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.background,
          borderColor: boxed ? slots.highlight : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_SM : null]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="rounded-2xl border p-3.5 active:opacity-70"
              style={[
                {
                  backgroundColor: slots.surface,
                  borderColor: slots.highlight,
                  width: useTwoColumns ? '48%' : '100%',
                },
                BOXED_SHADOW_SM,
              ]}
            >
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${slots.accent}18` }}>
                <ConnectionIcon color={slots.accent} field={field} size={17} />
              </View>
              {renderCopy(presentation, slots.textPrimary, slots.textSecondary)}
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Icon Dock (badge): enterprise command dock with compact channel tiles
  if (section.templateId === 'badge') {
    const dockItemWidth = compact ? '23.5%' : width >= 600 ? '23.5%' : '31.5%';
    return (
      <View
        className={`overflow-hidden ${compact ? 'p-3' : 'p-4'} ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.background,
          borderColor: boxed ? slots.accent : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_MD : null]}
      >
        <View className="flex-row flex-wrap items-stretch justify-between gap-y-2.5">
          {fields.map((field) => {
            const presentation = getConnectionPresentation(field, showEmpty);
            return (
              <Pressable
                key={field.id}
                accessibilityRole="button"
                accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                disabled={!resolveActionUrl(field)}
                onPress={() => handlePress(field)}
                className={`${compact ? 'px-1.5 py-2' : 'px-2 py-3'} items-center justify-center rounded-2xl border active:opacity-70`}
                style={{
                  width: dockItemWidth,
                  backgroundColor: slots.surface,
                  borderColor: slots.highlight,
                  minHeight: compact ? 62 : 76,
                  ...BOXED_SHADOW_SM,
                }}
              >
                <View
                  className="items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${slots.accent}14`,
                    width: compact ? 30 : 38,
                    height: compact ? 30 : 38,
                  }}
                >
                  <ConnectionIcon color={slots.accent} field={field} size={compact ? 14 : 18} />
                </View>
                <Text
                  numberOfLines={1}
                  className={compact ? 'mt-1.5 text-[9px] font-extrabold' : 'mt-2 text-[11px] font-extrabold'}
                  style={{ color: slots.textPrimary, fontFamily, letterSpacing, textAlign: 'center' }}
                >
                  {presentation.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Split Matrix (split): balanced directory grid
  if (section.templateId === 'split') {
    return (
      <View
        className={`overflow-hidden p-3 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.highlight : undefined,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_SM : null]}
      >
        <View className="flex-row flex-wrap gap-2">
          {fields.map((field, idx) => {
            const presentation = getConnectionPresentation(field, showEmpty);
            const isFull = idx === 0 && fields.length % 2 !== 0;
            return (
              <Pressable
                key={field.id}
                accessibilityRole="button"
                accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                disabled={!resolveActionUrl(field)}
                onPress={() => handlePress(field)}
                className="flex-row items-center rounded-xl border p-3 active:opacity-70"
                style={{
                  backgroundColor: isFull ? `${slots.accent}14` : slots.background,
                  borderColor: isFull ? slots.accent : slots.highlight,
                  width: isFull ? '100%' : useTwoColumns ? '48.5%' : '100%',
                }}
              >
                <ConnectionIcon color={slots.accent} field={field} size={16} />
                <View className="ml-2.5 flex-1 min-w-0">
                  {renderCopy(presentation, slots.textPrimary, slots.textSecondary)}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Cyber Grid (neon): high-contrast tech readout rows
  if (section.templateId === 'neon') {
    return (
      <View
        className={`gap-2.5 overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{
          backgroundColor: '#0F172A',
          borderColor: slots.accent,
          borderWidth: 1.5,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        }, boxed ? BOXED_SHADOW_SM : null]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="flex-row items-center rounded-xl border px-3.5 py-3 active:opacity-70"
              style={{
                backgroundColor: '#1E293B',
                borderColor: slots.accent,
                borderWidth: 1,
              }}
            >
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${slots.accent}22`, borderWidth: 1, borderColor: slots.accent }}
              >
                <ConnectionIcon color={slots.accent} field={field} size={15} />
              </View>
              {renderCopy(presentation, '#FFFFFF', slots.accent)}
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: slots.accent }} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Action Tiles (classic): clean corporate directory rows
  return (
    <View
      className={`overflow-hidden px-4 py-2 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
      style={[{
        backgroundColor: slots.surface,
        borderColor: boxed ? slots.accent : undefined,
        height: compact ? '100%' : undefined,
        minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
      }, boxed ? BOXED_SHADOW_SM : null]}
    >
      {fields.map((field, index) => {
        const presentation = getConnectionPresentation(field, showEmpty);
        return (
          <Pressable
            key={field.id}
            accessibilityRole="button"
            accessibilityLabel={`${presentation.label}: ${presentation.value}`}
            disabled={!resolveActionUrl(field)}
            onPress={() => handlePress(field)}
            className="flex-row items-center py-3 active:opacity-70"
            style={{ borderBottomColor: slots.borderColor, borderBottomWidth: index === fields.length - 1 ? 0 : 1 }}
          >
            <View
              className="mr-4 items-center justify-center rounded-full"
              style={{ backgroundColor: slots.accent, height: compact ? 38 : 52, width: compact ? 38 : 52 }}
            >
              <ConnectionIcon color={slots.background} field={field} size={compact ? 14 : 18} />
            </View>
            {renderCopy(presentation, slots.textPrimary, slots.textSecondary)}
          </Pressable>
        );
      })}
    </View>
  );
}
