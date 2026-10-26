import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import type { QrSvgRef } from '../Services/qrExportService';
import type { QrCustomizationPreset } from '../types/share.types';

export interface ShareQrHeroCardProps {
  cardName: string;
  cardCategory?: string;
  shareUrl: string;
  loading?: boolean;
  error?: string;
  preset: QrCustomizationPreset;
  onQrRef?: (ref: QrSvgRef | null) => void;
  onPressExpand?: () => void;
}

export function ShareQrHeroCard({
  cardName,
  shareUrl,
  loading = false,
  error,
  preset,
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
        borderColor: isLightSurface ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.22)',
      }}
      className="w-full items-center justify-center rounded-xl border px-6 pb-6 pt-7 active:opacity-95"
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

      <Text
        variant="none"
        style={{ color: preset.foregroundColor }}
        className="mt-5 text-center text-[16px] font-medium tracking-tight"
      >
        Scan to share card
      </Text>
    </Pressable>
  );
}
