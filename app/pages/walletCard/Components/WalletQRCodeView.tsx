import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import { DEFAULT_QR_CUSTOMIZATION } from '@/pages/share/Config/qrCustomizationDefaults';
import type { QrCustomization } from '@/pages/share/types/share.types';

export type WalletQRCodeViewProps = {
  value: string;
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  containerColor?: string;
  borderColor?: string;
  accentColor?: string;
  centerLogoUrl?: string;
  centerLogoBackground?: string;
  customization?: QrCustomization;
  style?: StyleProp<ViewStyle>;
};

export function WalletQRCodeView({
  value,
  size = 72,
  foregroundColor = '#0f172a',
  backgroundColor = '#ffffff',
  containerColor = '#ffffff',
  borderColor = 'rgba(255, 255, 255, 0.25)',
  accentColor = '#38bdf8',
  centerLogoUrl,
  centerLogoBackground,
  customization = DEFAULT_QR_CUSTOMIZATION,
  style,
}: WalletQRCodeViewProps) {
  return (
    <View
      accessibilityLabel="Digital card QR code"
      accessibilityRole="image"
      style={[
        {
          padding: customization.frameStyle === 'none' ? 0 : 6,
          backgroundColor: containerColor,
          borderRadius:
            customization.frameStyle === 'none'
              ? 0
              : customization.frameStyle === 'simple'
                ? 6
                : 14,
          borderWidth: customization.frameStyle === 'none' ? 0 : 1,
          borderColor: customization.frameStyle === 'badge' ? accentColor : borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}
    >
      {/* No link yet (loading or offline): a blank tile, never a QR to a placeholder address. */}
      {value ? (
        <>
          <QRCodeView
            value={value}
            size={size}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            accentColor={accentColor}
            framed={false}
            showCenterLogo
            centerLogoUrl={centerLogoUrl}
            centerLogoBackground={centerLogoBackground}
            centerLogoBorderColor={accentColor}
            patternStyle={customization.patternStyle}
            cornerStyle={customization.cornerStyle}
            logoSize={customization.logoSize}
          />
          {customization.captionVisible && customization.caption.trim() ? (
            <View
              className={
                customization.frameStyle === 'badge'
                  ? 'mt-1 rounded-full border px-1.5 py-0.5'
                  : 'mt-1'
              }
              style={
                customization.frameStyle === 'badge'
                  ? { borderColor: accentColor, backgroundColor: `${accentColor}22` }
                  : undefined
              }
            >
              <Text
                variant="none"
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{ color: foregroundColor, fontSize: Math.max(6, size * 0.1) }}
              >
                {customization.caption}
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <View style={{ width: size, height: size, backgroundColor, borderRadius: 6, opacity: 0.6 }} />
      )}
    </View>
  );
}
