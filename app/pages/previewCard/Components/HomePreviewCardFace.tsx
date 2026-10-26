import { ActivityIndicator, Pressable, View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import {
  IdentityImage,
  UniversalLogoBadge,
} from '@/pages/cards/Templates/sections/SectionSharedComponents';
import { useShareUrl } from '@/pages/share/Hooks/useShareUrl';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
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

  const coverHeight = Math.round(Math.min(height * 0.22, width * 0.38));
  const profileSize = Math.round(Math.min(width * 0.26, 88));
  const logoWidth = Math.min(128, Math.max(96, Math.round(width - profileSize - 56)));
  const logoHeight = Math.round(logoWidth * (56 / 152));
  const qrSize = Math.round(Math.min(width * 0.52, height * 0.36));

  const surface = bodySlots.surface || '#2f3542';
  const textPrimary = bodySlots.textPrimary || '#ffffff';
  const textSecondary = bodySlots.textSecondary || 'rgba(255,255,255,0.78)';
  const borderColor = headerSlots.accent || 'rgba(148,163,184,0.35)';

  return (
    <View
      accessibilityLabel={`${name}, ${jobTitle} preview card`}
      accessibilityRole="summary"
      className="overflow-hidden rounded-[16px]"
      style={{
        width,
        height,
        backgroundColor: surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 8,
      }}
    >
      <View style={{ height: coverHeight, width: '100%' }}>
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
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
          >
            <MoreHorizontal color="#ffffff" size={20} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-1 px-4 pb-4" style={{ backgroundColor: surface }}>
        <View
          className="flex-row items-end justify-between"
          style={{ marginTop: -profileSize * 0.52, marginBottom: 10 }}
        >
          <IdentityImage
            field={profilePhoto}
            iconColor={textSecondary}
            placeholderColor={surface}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
              borderWidth: 2,
              borderColor: '#ffffff',
            }}
          />
          <View style={{ marginBottom: 6, maxWidth: logoWidth }}>
            <UniversalLogoBadge
              bare
              cardTheme={identityTheme}
              compact
              field={logo}
              logoSize={{ width: logoWidth, height: logoHeight }}
              placement="on-surface"
              slots={bodySlots}
              templateId="classic"
            />
          </View>
        </View>

        <Text
          variant="none"
          numberOfLines={2}
          className="text-[17px] font-bold capitalize leading-tight"
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
          className="mt-0.5 text-[14px] font-normal"
          style={{ color: textSecondary }}
        >
          {company}
        </Text>

        <View className="mt-3 min-h-0 flex-1 items-center justify-center">
          <View
            className="items-center rounded-xl border px-4 pb-4 pt-5"
            style={{ borderColor, backgroundColor: 'rgba(0,0,0,0.12)' }}
          >
            {share.url ? (
              <QRCodeView
                value={share.url}
                size={qrSize}
                foregroundColor="#ffffff"
                backgroundColor="transparent"
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
              className="mt-4 text-center text-[13px] font-medium"
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
