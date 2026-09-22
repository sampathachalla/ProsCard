import { View, type StyleProp, type ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type QRCodeViewProps = {
  value: string;
  size: number;
  foregroundColor?: string;
  backgroundColor?: string;
  framed?: boolean;
  padding?: number;
  style?: StyleProp<ViewStyle>;
};

export function QRCodeView({
  value,
  size,
  foregroundColor = '#0f172a',
  backgroundColor = '#ffffff',
  framed = true,
  padding = 16,
  style,
}: QRCodeViewProps) {
  const content = (
    <QRCode
      value={value || 'https://proscard.app'}
      size={size}
      color={foregroundColor}
      backgroundColor={backgroundColor}
      quietZone={0}
    />
  );

  if (!framed) {
    return (
      <View
        accessibilityLabel="Contact QR code"
        accessibilityRole="image"
        style={style}
      >
        {content}
      </View>
    );
  }

  return (
    <View
      accessibilityLabel="Contact QR code"
      accessibilityRole="image"
      style={[
        {
          padding,
          backgroundColor: backgroundColor,
          borderRadius: 24,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
      ]}
      className="items-center justify-center border border-slate-100 dark:border-slate-800"
    >
      {content}
    </View>
  );
}

