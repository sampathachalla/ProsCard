import { ActivityIndicator, Pressable, View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import type { BusinessCard, ResolvedLayoutSlots } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import {
  IdentityImage,
  UniversalLogoBadge,
} from '@/pages/cards/Templates/sections/SectionSharedComponents';
import { useShareUrl } from '@/pages/share/Hooks/useShareUrl';
import { isColorLight, mixHexColors, resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { walletField, walletFieldValue } from '@/pages/walletCard/Utils/walletPassFields';

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
  const sections = createCardDetailTemplate(card, profile);
  const identity = sections.find((section) => section.id === 'identity');
  const professional = sections.find((section) => section.id === 'professional');
  const share = useShareUrl(card.id);

  const identityTheme = card.sectionThemes.identity;
  const professionalTheme = card.sectionThemes.professional;
  const headerSlots = resolveLayoutColorSlots({ templateId: 'classic', theme: identityTheme });
  const bodySlots = resolveLayoutColorSlots({ templateId: 'classic', theme: professionalTheme });

  const coverPhoto = identity ? walletField(identity, 'coverPhoto') : undefined;
  const profilePhoto = identity ? walletField(identity, 'profilePhoto') : undefined;
  const logo = identity ? walletField(identity, 'logo') : undefined;

  const name = identity ? walletFieldValue(identity, 'preferredName', card.name) : card.name;
  const jobTitle = professional ? walletFieldValue(professional, 'title', card.title) : card.title;
  const company = professional ? walletFieldValue(professional, 'company', card.company) : card.company;

  const coverHeight = Math.round(Math.min(height * 0.21, width * 0.36));
  const profileSize = Math.round(Math.min(width * 0.25, 84));
  const logoWidth = Math.min(132, Math.max(100, Math.round(width - profileSize - 56)));
  const logoHeight = Math.round(logoWidth * (52 / 152));
  const qrSize = Math.round(Math.min(width * 0.5, height * 0.34));

  // Keep the enterprise dark theme surface on the Home preview card face
  const rawSurface = bodySlots.surface || '#0f172a';
  const surface = isColorLight(rawSurface)
    ? '#0f172a'
    : mixHexColors(rawSurface, '#0f172a', 0.35);
  const qrContainerBg = '#111827';
  const accentColor = headerSlots.accent || '#38bdf8';
  const textPrimary = '#f8fafc';
  const textSecondary = '#cbd5e1';
  const textMuted = '#94a3b8';
  const qrBorderColor = 'rgba(56, 189, 248, 0.32)';

  const darkLogoSlots: ResolvedLayoutSlots = {
    ...bodySlots,
    surface,
    background: '#020617',
    textPrimary,
    textSecondary,
    isDark: true,
  };

  return (
    <View
      accessibilityLabel={`${name}, ${jobTitle} preview card`}
      accessibilityRole="summary"
      className="overflow-hidden rounded-[20px] border"
      style={{
        width,
        height,
        backgroundColor: surface,
        borderColor: 'rgba(148, 163, 184, 0.18)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.36,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <View
        style={{
          height: coverHeight,
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <IdentityImage
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
              field={profilePhoto}
              iconColor="#94a3b8"
              placeholderColor="#1e293b"
              style={{
                width: profileSize,
                height: profileSize,
                borderRadius: profileSize / 2,
                borderWidth: 2.5,
                borderColor: 'rgba(226, 232, 240, 0.9)',
              }}
            />
          </View>
          <View style={{ marginTop: 8, maxWidth: logoWidth }}>
            <UniversalLogoBadge
              bare
              cardTheme={identityTheme}
              compact
              field={logo}
              logoSize={{ width: logoWidth, height: logoHeight }}
              placement="on-surface"
              slots={darkLogoSlots}
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
            className="items-center rounded-2xl border px-4 pb-4 pt-5"
            style={{
              borderColor: qrBorderColor,
              backgroundColor: qrContainerBg,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            {share.url ? (
              <QRCodeView
                value={share.url}
                size={qrSize}
                foregroundColor="#ffffff"
                backgroundColor={qrContainerBg}
                accentColor={accentColor}
                framed={false}
                showCenterLogo
              />
            ) : (
              <View
                className="items-center justify-center"
                style={{ width: qrSize, height: qrSize }}
              >
                <ActivityIndicator color={textPrimary} />
              </View>
            )}
            <Text
              variant="none"
              className="mt-3.5 text-center text-[13px] font-medium tracking-wide"
              style={{ color: textSecondary }}
            >
              Scan to share card
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
