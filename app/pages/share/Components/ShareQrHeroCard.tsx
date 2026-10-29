import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import type { QrSvgRef } from '../Services/qrExportService';
import type { QrCustomization, QrCustomizationPreset } from '../types/share.types';

export interface ShareQrHeroCardProps {
  cardName: string;
  cardCategory?: string;
  shareUrl: string;
  loading?: boolean;
  error?: string;
  preset: QrCustomizationPreset;
  centerLogoUrl?: string;
  centerLogoBackground?: string;
  centerLogoBorderColor?: string;
  customization: QrCustomization;
  onQrRef?: (ref: QrSvgRef | null) => void;
  onPressExpand?: () => void;
}

export function ShareQrHeroCard({
  cardName,
  shareUrl,
  loading = false,
  error,
  preset,
  centerLogoUrl,
  centerLogoBackground,
  centerLogoBorderColor,
  customization,
  onQrRef,
  onPressExpand,
}: ShareQrHeroCardProps) {
  const isLightSurface = preset.backgroundColor.toLowerCase() === '#ffffff';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${cardName} QR code. Scan to share card.`}
      disabled={!shareUrl || !onPressExpand}
      onPress={onPressExpand}
      style={{
        backgroundColor: preset.backgroundColor,
        borderColor: customization.frameStyle === 'none' ? 'transparent' : isLightSurface ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.22)',
        borderRadius: customization.frameStyle === 'simple' ? 8 : customization.frameStyle === 'none' ? 0 : 18,
      }}
      className="w-full items-center justify-center border px-6 pb-6 pt-7 active:opacity-95"
    >
      {shareUrl ? (
        <QRCodeView
          value={shareUrl}
          size={224}
          foregroundColor={preset.foregroundColor}
          backgroundColor={preset.backgroundColor}
          accentColor={preset.accentColor}
          framed={false}
          showCenterLogo
          centerLogoUrl={centerLogoUrl}
          centerLogoBackground={centerLogoBackground}
          centerLogoBorderColor={centerLogoBorderColor}
          patternStyle={customization.patternStyle}
          cornerStyle={customization.cornerStyle}
          logoSize={customization.logoSize}
          getRef={onQrRef}
        />
      ) : (
        <View className="h-[224px] w-[224px] items-center justify-center">
          {loading ? (
            <ActivityIndicator size="large" color={preset.foregroundColor} />
          ) : (
            <Text
              variant="none"
              style={{ color: preset.foregroundColor }}
              className="px-4 text-center text-sm font-medium opacity-80"
            >
              {error || 'Create a card to generate your QR code'}
            </Text>
          )}
        </View>
      )}

      {customization.captionVisible ? <View style={customization.frameStyle === 'badge' ? {
        backgroundColor: `${preset.accentColor}22`, borderColor: preset.accentColor,
      } : undefined} className={customization.frameStyle === 'badge' ? 'mt-5 rounded-full border px-4 py-2' : 'mt-5'}><Text
        variant="none"
        style={{ color: preset.foregroundColor }}
        className="text-center text-[16px] font-medium tracking-tight"
      >
        {customization.caption}
      </Text>
      </View> : null}
    </Pressable>
  );
}
