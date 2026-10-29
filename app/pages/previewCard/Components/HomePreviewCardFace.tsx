import { ActivityIndicator, Pressable, View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import type { BusinessCard, ResolvedLayoutSlots } from '@/pages/cards/types/card.types';
import { savedSectionTheme } from '@/pages/addCard/Config/cardTagDesignPresets';
import type { Profile } from '@/pages/profile/types/profile.types';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import {
  IdentityImage,
  UniversalLogoBadge,
} from '@/pages/cards/Templates/sections/SectionSharedComponents';
import { useShareUrl } from '@/pages/share/Hooks/useShareUrl';
import { useQrCustomization } from '@/pages/share/Hooks/useQrCustomization';
import { resolveQrPreset } from '@/pages/share/Utils/resolveQrPreset';
import {
  isColorLight,
  resolveCardAvatarRing,
  resolveCardCoverDivider,
  resolveHomePreviewChromeBorder,
  resolveHomePreviewOuterChromeStyle,
  resolveLayoutColorSlots,
} from '@/utils/cardThemeColor';
import { walletField, walletFieldValue } from '@/pages/walletCard/Utils/walletPassFields';
import { resolveCardDisplayMedia } from '@/pages/cards/Utils/resolveCardDisplayMedia';

type HomePreviewCardFaceProps = {
  card: BusinessCard;
  profile: Profile;
  width: number;
  height: number;
  onMenuPress?: () => void;
};

export function HomePreviewCardFace({
  card,
  profile,
  width,
  height,
  onMenuPress,
}: HomePreviewCardFaceProps) {
  const displayCard = resolveCardDisplayMedia(card, profile);
  const sections = createCardDetailTemplate(displayCard, profile);
  const identity = sections.find((section) => section.id === 'identity');
  const professional = sections.find((section) => section.id === 'professional');
  const share = useShareUrl(card.id);
  const qrCustomization = useQrCustomization(card.id);
  const qrPreset = resolveQrPreset(card, qrCustomization);
  const coverPhoto = identity ? walletField(identity, 'coverPhoto') : undefined;
  const profilePhoto = identity ? walletField(identity, 'profilePhoto') : undefined;
  const logo = identity ? walletField(identity, 'logo') : undefined;
  const logoBackdrop = identity ? walletFieldValue(identity, 'logoBackdrop', '') : '';

  // Saved themes only, exactly like the public share page; profile theme toggles are stored on the card.
  const identityTheme = savedSectionTheme(card, 'identity');
  const professionalTheme = savedSectionTheme(card, 'professional');
  const activeTheme = identityTheme;
  const headerSlots = resolveLayoutColorSlots({ templateId: 'classic', theme: identityTheme });
  const bodySlots = resolveLayoutColorSlots({ templateId: 'classic', theme: professionalTheme });

  const name = identity ? walletFieldValue(identity, 'preferredName', card.name) : card.name;
  const jobTitle = professional ? walletFieldValue(professional, 'title', card.title) : card.title;
  const company = professional ? walletFieldValue(professional, 'company', card.company) : card.company;

  const coverHeight = Math.round(Math.min(height * 0.21, width * 0.36));
  const profileSize = Math.round(Math.min(width * 0.25, 84));
  const logoWidth = Math.min(132, Math.max(100, Math.round(width - profileSize - 56)));
  const logoHeight = Math.round(logoWidth * (52 / 152));
  const qrSize = Math.round(Math.min(width * 0.5, height * 0.34));

  // Respect the card's theme surface (brand-matched or customized)
  const surface = bodySlots.surface || activeTheme?.surfaceColor || '#ffffff';
  const isSurfaceLight = isColorLight(surface);

  const qrContainerBg = qrPreset.backgroundColor;
  const accentColor = headerSlots.accent || activeTheme?.accentColor || '#38bdf8';
  const textPrimary = isSurfaceLight ? (bodySlots.textPrimary || '#0f172a') : '#f8fafc';
  const textSecondary = isSurfaceLight ? (bodySlots.textSecondary || '#334155') : '#cbd5e1';
  const textMuted = isSurfaceLight ? (bodySlots.textMuted || '#64748b') : '#94a3b8';
  const chromeBorder = resolveHomePreviewChromeBorder(surface, accentColor);
  const qrBorderColor = chromeBorder;
  const { innerClipRadius, outer: outerChrome } = resolveHomePreviewOuterChromeStyle({
    chromeBorder,
    height,
    surfaceColor: surface,
    width,
  });

  const cardLogoSlots: ResolvedLayoutSlots = {
    ...bodySlots,
    surface,
    background: bodySlots.background || surface,
    textPrimary,
    textSecondary,
    isDark: !isSurfaceLight,
  };

  return (
    <View
      accessibilityLabel={`${name}, ${jobTitle} preview card`}
      accessibilityRole="summary"
      style={{
        width,
        height,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: isSurfaceLight ? 0.12 : 0.36,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <View style={outerChrome}>
        <View
          style={{
            flex: 1,
            borderBottomLeftRadius: innerClipRadius,
            borderBottomRightRadius: innerClipRadius,
            borderTopLeftRadius: innerClipRadius,
            borderTopRightRadius: innerClipRadius,
            borderRadius: innerClipRadius,
            overflow: 'hidden',
          }}
        >
      <View
        style={{
          height: coverHeight,
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: resolveCardCoverDivider(),
        }}
      >
        <IdentityImage
          key={`${card.id}-cover-${coverPhoto?.value ?? 'account-fallback'}`}
          field={coverPhoto}
          fit="cover"
          style={{ position: 'absolute', inset: 0, width, height: coverHeight }}
        />
        {onMenuPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Card options"
            onPress={onMenuPress}
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full active:opacity-80"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.58)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.16)',
            }}
          >
            <MoreHorizontal color="#ffffff" size={20} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-1 px-4 pb-4" style={{ backgroundColor: surface }}>
        {/* Avatar overlaps cover seam; enterprise logo sits cleanly on the dark card surface below the cover */}
        <View className="mb-2.5 flex-row items-start justify-between">
          <View style={{ marginTop: -Math.round(profileSize * 0.48) }}>
            <IdentityImage
              key={`${card.id}-profile-${profilePhoto?.value ?? 'account-fallback'}`}
              field={profilePhoto}
              iconColor="#94a3b8"
              placeholderColor="#1e293b"
              style={{
                width: profileSize,
                height: profileSize,
                borderRadius: profileSize / 2,
                borderWidth: 2.5,
                borderColor: resolveCardAvatarRing(surface),
              }}
            />
          </View>
          <View style={{ marginTop: 8, maxWidth: logoWidth }}>
            <UniversalLogoBadge
              key={`${card.id}-logo-${logo?.value ?? 'account-fallback'}`}
              bare
              backdropColor={logoBackdrop || undefined}
              cardTheme={identityTheme}
              compact
              field={logo}
              logoSize={{ width: logoWidth, height: logoHeight }}
              placement="on-surface"
              slots={cardLogoSlots}
              templateId="classic"
            />
          </View>
        </View>

        <Text
          variant="none"
          numberOfLines={2}
          className="text-[18px] font-bold capitalize leading-tight tracking-tight"
          style={{ color: textPrimary }}
        >
          {name}
        </Text>
        <Text
          variant="none"
          numberOfLines={1}
          className="mt-1 text-[14px] font-medium"
          style={{ color: textSecondary }}
        >
          {jobTitle}
        </Text>
        <Text
          variant="none"
          numberOfLines={1}
          className="mt-0.5 text-[13px] font-normal"
          style={{ color: textMuted }}
        >
          {company}
        </Text>

        <View className="mt-3 min-h-0 flex-1 items-center justify-center">
          <View
            className="items-center px-4 pb-4 pt-5"
            style={{
              borderWidth: qrCustomization.frameStyle === 'none' ? 0 : 1.5,
              borderColor:
                qrCustomization.frameStyle === 'badge'
                  ? qrPreset.accentColor
                  : qrBorderColor,
              backgroundColor: qrContainerBg,
              borderRadius:
                qrCustomization.frameStyle === 'none'
                  ? 0
                  : qrCustomization.frameStyle === 'simple'
                    ? 8
                    : 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isSurfaceLight ? 0.06 : 0.25,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            {share.url ? (
              <QRCodeView
                value={share.url}
                size={qrSize}
                foregroundColor={qrPreset.foregroundColor}
                backgroundColor={qrPreset.backgroundColor}
                accentColor={qrPreset.accentColor}
                framed={false}
                showCenterLogo
                centerLogoUrl={logo?.value}
                centerLogoBackground={logoBackdrop || card.appliedTheme?.surfaceColor}
                centerLogoBorderColor={qrPreset.accentColor}
                patternStyle={qrCustomization.patternStyle}
                cornerStyle={qrCustomization.cornerStyle}
                logoSize={qrCustomization.logoSize}
              />
            ) : (
              <View
                className="items-center justify-center"
                style={{ width: qrSize, height: qrSize }}
              >
                <ActivityIndicator color={textPrimary} />
              </View>
            )}
            {qrCustomization.captionVisible && qrCustomization.caption.trim() ? (
              <View
                className={
                  qrCustomization.frameStyle === 'badge'
                    ? 'mt-3.5 rounded-full border px-3 py-1.5'
                    : 'mt-3.5'
                }
                style={
                  qrCustomization.frameStyle === 'badge'
                    ? {
                        borderColor: qrPreset.accentColor,
                        backgroundColor: `${qrPreset.accentColor}22`,
                      }
                    : undefined
                }
              >
                <Text
                  variant="none"
                  className="text-center text-[13px] font-medium"
                  style={{ color: qrPreset.foregroundColor }}
                >
                  {qrCustomization.caption}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
        </View>
      </View>
    </View>
  );
}
