import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { CardTapGesture } from '@/components/gestures';
import { createCardDetailTemplate } from '@/components/cardsComponents/Templates/cardDetailTemplate';
import { getWalletCardDimensions } from './walletCardLayout';
import { WalletIdentityPassRenderer } from './WalletIdentityPassRenderer';
import { WalletProfessionalPassRenderer } from './WalletProfessionalPassRenderer';
import { useShareUrl } from '@/components/sharingComponents/Hooks/useShareUrl';

export type WalletCardRenderEngineProps = {
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

type WalletCardShellProps = {
  card: BusinessCard;
  width: number;
  height: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function WalletCardShell({ card, width, height, children, style }: WalletCardShellProps) {
  const identityTheme = card.sectionThemes.identity;
  const proTheme = card.sectionThemes.professional;
  const borderColor = identityTheme.accentColor || proTheme.accentColor || '#38bdf8';

  return (
    <View
      accessibilityLabel={`${card.name} digital wallet card`}
      accessibilityRole="image"
      className="overflow-hidden rounded-[26px] border shadow-md"
      style={[
        {
          width,
          height,
          backgroundColor: identityTheme.backgroundColor || '#020617',
          borderColor,
          borderWidth: 1.5,
          flexDirection: 'column',
          elevation: 6,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.22,
          shadowRadius: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Digital Wallet Pass:
 * Renders Section-1 (Identity) and Section-2 (Professional) based on their layouts and themes,
 * with an integrated QR code for contactless scanning and sharing.
 */
export function WalletCardRenderEngine({
  card,
  profile,
  width,
  height,
  qrValue,
  onDoubleTap,
  onSwipeDown,
  onSingleTap,
  style,
}: WalletCardRenderEngineProps) {
  const dimensions = getWalletCardDimensions(width, height);
  const detailSections = createCardDetailTemplate(card, profile);
  const identitySection = detailSections.find((s) => s.id === 'identity');
  const professionalSection = detailSections.find((s) => s.id === 'professional');

  // The QR must open the public share page (/share/<slug>), so it uses the card's real share link.
  // It is fetched once per card and cached; the code stays blank until it is known.
  const share = useShareUrl(qrValue ? null : card.id);
  const effectiveQrValue = qrValue || share.url;
  const identityTheme = card.sectionThemes.identity;
  const proTheme = card.sectionThemes.professional;

  const pass = (
    <WalletCardShell card={card} width={dimensions.width} height={dimensions.height} style={style}>
      {identitySection ? (
        <View style={{ height: dimensions.identityHeight, overflow: 'hidden' }}>
          <WalletIdentityPassRenderer
            cardTheme={identityTheme}
            gradient={identityTheme.gradient}
            section={identitySection}
            height={dimensions.identityHeight}
          />
        </View>
      ) : null}

      {professionalSection ? (
        <View style={{ height: dimensions.professionalHeight, overflow: 'hidden' }}>
          <WalletProfessionalPassRenderer
            cardTheme={proTheme}
            gradient={proTheme.gradient}
            section={professionalSection}
            qrValue={effectiveQrValue}
            height={dimensions.professionalHeight}
          />
        </View>
      ) : null}
    </WalletCardShell>
  );

  if (!onDoubleTap && !onSwipeDown && !onSingleTap) {
    return pass;
  }

  return (
    <CardTapGesture
      enabled={Boolean(onDoubleTap || onSwipeDown || onSingleTap)}
      onDoubleTap={onDoubleTap ?? (() => {})}
      onSingleTap={onSingleTap}
      onSwipeDown={onSwipeDown}
    >
      {pass}
    </CardTapGesture>
  );
}
