import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export type WalletQRCodeViewProps = {
  value: string;
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  containerColor?: string;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function WalletQRCodeView({
  value,
  size = 72,
  foregroundColor = '#0f172a',
  backgroundColor = '#ffffff',
  containerColor = '#ffffff',
  borderColor = 'rgba(255, 255, 255, 0.25)',
  style,
}: WalletQRCodeViewProps) {

  return (
    <View
      accessibilityLabel="Digital card QR code"
      accessibilityRole="image"
      style={[
        {
          padding: 6,
          backgroundColor: containerColor,
          borderRadius: 14,
          borderWidth: 1,
          borderColor,
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
        <QRCode value={value} size={size} color={foregroundColor} backgroundColor={backgroundColor} quietZone={0} />
      ) : (
        <View style={{ width: size, height: size, backgroundColor, borderRadius: 6, opacity: 0.6 }} />
      )}
    </View>
  );
}
