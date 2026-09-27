import React from 'react';
import { View } from 'react-native';
import type { BusinessCard } from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { CardTapGesture } from '@/components/gestures';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { getWalletCardDimensions, WALLET_SECTIONS } from './walletCardLayout';
import { WalletIdentityPassRenderer } from './WalletIdentityPassRenderer';

export type WalletDesignEngineProps = {
  card: BusinessCard;
  profile: Profile;
  width: number;
  onDoubleTap?: () => void;
  onSwipeDown?: () => void;
  onSingleTap?: () => void;
};

type WalletCardShellProps = {
  card: BusinessCard;
  width: number;
  height: number;
  children: React.ReactNode;
};

function WalletCardShell({ card, width, height, children }: WalletCardShellProps) {
  const theme = card.sectionThemes.identity;
  return (
    <View
      className="overflow-hidden rounded-2xl border"
      style={{
        width,
        height,
        backgroundColor: theme.backgroundColor,
        borderColor: theme.accentColor,
        flexDirection: 'column',
      }}
    >
      {children}
    </View>
  );
}

/** Wallet pass: section 1 (identity) only — layout from `sectionLayouts.identity`. */
export function WalletStackedPass({
  card,
  profile,
  width,
  height,
}: {
  card: BusinessCard;
  profile: Profile;
  width: number;
  height: number;
}) {
  const detailSections = createCardDetailTemplate(card, profile);
  const identitySection = detailSections.find((section) => section.id === 'identity');
  if (!identitySection) {
    return null;
  }

  const identityTheme = card.sectionThemes.identity;

  return (
    <WalletCardShell card={card} width={width} height={height}>
      <View style={{ flex: 1, height, overflow: 'hidden' }}>
        <WalletIdentityPassRenderer
          cardTheme={identityTheme}
          gradient={identityTheme.gradient}
          section={identitySection}
        />
      </View>
    </WalletCardShell>
  );
}

/** Renders ID-1 wallet pass (identity section layout only) and optional gestures. */
export function WalletDesignEngine({
  card,
  profile,
  width,
  onDoubleTap,
  onSwipeDown,
  onSingleTap,
}: WalletDesignEngineProps) {
  const { height: passHeight } = getWalletCardDimensions(width);

  const pass = (
    <WalletStackedPass card={card} profile={profile} width={width} height={passHeight} />
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

export { WALLET_SECTIONS };
