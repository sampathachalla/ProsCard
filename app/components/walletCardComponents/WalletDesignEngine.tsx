import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Building2, Mail, MapPin, Phone } from 'lucide-react-native';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { CardTapGesture } from '@/components/gestures';
import { createCardDetailTemplate } from '@/components/cardsComponents/Templates/cardDetailTemplate';
import { IdentityImage, UniversalLogoBadge } from '@/components/cardsComponents/Templates/sections/SectionSharedComponents';
import { getCardFontFamily, getCardLetterSpacing } from '@/components/cardsComponents/Templates/cardTheme';
import { Text } from '@/components/uiComponents/Text';
import { useShareUrl } from '@/components/sharingComponents/Hooks/useShareUrl';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { getWalletCardDimensions } from './walletCardLayout';
import { walletField, walletFieldValue } from './walletPassFields';
import { WalletQRCodeView } from './WalletQRCodeView';

export type WalletDesignEngineProps = {
  card: BusinessCard;
  profile: Profile;
  width: number;
  height?: number;
  qrValue?: string;
  onDoubleTap?: () => void;
  onSwipeDown?: () => void;
  onSingleTap?: () => void;
  style?: StyleProp<ViewStyle>;
};

export type WalletStackedPassProps = {
  card: BusinessCard;
  profile: Profile;
  width: number;
  height: number;
  qrValue?: string;
  style?: StyleProp<ViewStyle>;
};

type ContactRowProps = {
  color: string;
  fontFamily?: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  iconColor: string;
  label: string;
  letterSpacing?: number;
  lines?: number;
  value: string;
};

function ContactRow({ color, fontFamily, icon: Icon, iconColor, label, letterSpacing, lines = 1, value }: ContactRowProps) {
  if (!value) return null;
  return (
    <View className="min-w-0 flex-row items-start" style={{ gap: 6 }}>
      <View className="mt-0.5 size-4 items-center justify-center rounded-full">
        <Icon color={iconColor} size={10} />
      </View>
      <View className="min-w-0 flex-1">
        <Text variant="none" numberOfLines={1} className="text-[7px] font-semibold uppercase leading-[9px]" style={{ color: iconColor, fontFamily, letterSpacing }}>
          {label}
        </Text>
        <Text variant="none" numberOfLines={lines} className="text-[10px] font-semibold leading-[12px]" style={{ color, fontFamily, letterSpacing }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/** Fixed wallet face: saved layout choices are ignored; theme and font are inherited. */
export function WalletStackedPass({ card, profile, width, height, qrValue, style }: WalletStackedPassProps) {
  const dimensions = getWalletCardDimensions(width, height);
  const sections = createCardDetailTemplate(card, profile);
  const identity = sections.find((section) => section.id === 'identity');
  const professional = sections.find((section) => section.id === 'professional');
  const connections = sections.find((section) => section.id === 'connections');
  const identityTheme = card.sectionThemes.identity;
  const professionalTheme = card.sectionThemes.professional;
  const connectionsTheme = card.sectionThemes.connections;
  const headerSlots = resolveLayoutColorSlots({ templateId: 'classic', theme: identityTheme });
  const bodySlots = resolveLayoutColorSlots({ templateId: 'classic', theme: professionalTheme });
  const contactSlots = resolveLayoutColorSlots({ templateId: 'classic', theme: connectionsTheme });
  const fontFamily = getCardFontFamily(professionalTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(professionalTheme.fontStyle);
  const share = useShareUrl(qrValue ? null : card.id);
  const effectiveQrValue = qrValue || share.url;
  const preferredName = identity ? walletFieldValue(identity, 'preferredName') : '';
  const jobTitle = professional ? walletFieldValue(professional, 'title') : '';
  const company = professional ? walletFieldValue(professional, 'company') : '';
  const connectionValue = (ids: string[]) => {
    const field = connections?.fields.find((item) => {
      const normalized = item.id.toLowerCase();
      return ids.some((id) => normalized.includes(id));
    });
    return field?.value?.trim() || '';
  };
  const phone = connectionValue(['phone', 'mobile']);
  const email = connectionValue(['email']);
  const address = connectionValue(['address', 'location']);
  const coverPhoto = identity ? walletField(identity, 'coverPhoto') : undefined;
  const logo = identity ? walletField(identity, 'logo') : undefined;
  const profilePhoto = identity ? walletField(identity, 'profilePhoto') : undefined;
  const headerHeight = Math.round(dimensions.height * 0.27);
  const qrSize = Math.max(48, Math.min(64, Math.round(dimensions.height * 0.26)));

  return (
    <View
      accessibilityLabel={`${preferredName || 'Digital'} standard wallet card`}
      accessibilityRole="image"
      className="overflow-hidden rounded-[26px] border shadow-md"
      style={[
        {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: bodySlots.surface,
          borderColor: headerSlots.accent,
          borderWidth: 1.5,
          elevation: 6,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.22,
          shadowRadius: 12,
        },
        style,
      ]}
    >
      <IdentityImage
        field={coverPhoto}
        fit="cover"
        style={{ position: 'absolute', inset: 0, width: dimensions.width, height: dimensions.height }}
      />
      <View className="flex-row items-center justify-between px-3" style={{ height: headerHeight }}>
        <View pointerEvents="none" className="absolute inset-0" style={{ backgroundColor: headerSlots.background, opacity: 0.86 }} />
        <IdentityImage
          field={profilePhoto}
          iconColor={headerSlots.textSecondary}
          placeholderColor={headerSlots.surface}
          style={{
            width: Math.round(headerHeight * 0.68),
            height: Math.round(headerHeight * 0.68),
            borderRadius: Math.round(headerHeight * 0.34),
            borderColor: headerSlots.accent,
            borderWidth: 1.5,
          }}
        />
        <UniversalLogoBadge
          cardTheme={identityTheme}
          compact
          field={logo}
          logoSize={{ width: Math.round(dimensions.width * 0.32), height: Math.round(headerHeight * 0.56) }}
          placement="on-cover"
          slots={headerSlots}
          templateId="classic"
        />
      </View>

      <View className="flex-1 flex-row">
        <View pointerEvents="none" className="absolute inset-0" style={{ backgroundColor: bodySlots.surface, opacity: 0.88 }} />
        <View className="justify-between px-3 py-2.5" style={{ width: '48%' }}>
          <View>
            <Text variant="none" adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={2} className="text-[14px] font-black leading-[16px]" style={{ color: bodySlots.textPrimary, fontFamily, letterSpacing }}>
              {preferredName}
            </Text>
            <Text variant="none" adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={2} className="mt-1 text-[11px] font-semibold leading-[13px]" style={{ color: bodySlots.textSecondary, fontFamily, letterSpacing }}>
              {jobTitle}
            </Text>
          </View>
          <WalletQRCodeView size={qrSize} value={effectiveQrValue} borderColor={bodySlots.accent} style={{ alignSelf: 'flex-start', borderRadius: 10, padding: 4 }} />
        </View>

        <View className="min-w-0 flex-1 px-3 py-2.5" style={{ gap: 7 }}>
          <ContactRow color={contactSlots.textPrimary} fontFamily={fontFamily} icon={Building2} iconColor={contactSlots.accent} label="Company" letterSpacing={letterSpacing} value={company} />
          <ContactRow color={contactSlots.textPrimary} fontFamily={fontFamily} icon={Phone} iconColor={contactSlots.accent} label="Phone" letterSpacing={letterSpacing} value={phone} />
          <ContactRow color={contactSlots.textPrimary} fontFamily={fontFamily} icon={Mail} iconColor={contactSlots.accent} label="Email" letterSpacing={letterSpacing} lines={2} value={email} />
          <ContactRow color={contactSlots.textPrimary} fontFamily={fontFamily} icon={MapPin} iconColor={contactSlots.accent} label="Address" letterSpacing={letterSpacing} lines={2} value={address} />
        </View>
      </View>
    </View>
  );
}

export function WalletDesignEngine({ card, profile, width, height, qrValue, onDoubleTap, onSwipeDown, onSingleTap, style }: WalletDesignEngineProps) {
  const dimensions = getWalletCardDimensions(width, height);
  const pass = <WalletStackedPass card={card} profile={profile} width={dimensions.width} height={dimensions.height} qrValue={qrValue} style={style} />;
  if (!onDoubleTap && !onSwipeDown && !onSingleTap) return pass;
  return (
    <CardTapGesture enabled={Boolean(onDoubleTap || onSwipeDown || onSingleTap)} onDoubleTap={onDoubleTap ?? (() => {})} onSingleTap={onSingleTap} onSwipeDown={onSwipeDown}>
      {pass}
    </CardTapGesture>
  );
}
