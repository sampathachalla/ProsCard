import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  background,
  cornerRadius,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  resizable,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

export type VCProsCardLiveActivityProps = {
  cardName: string;
  qrImageUri?: string;
};

/**
 * Keeps the card QR on the Lock Screen banner (full color, unlike Lock Screen widgets,
 * so it stays scannable) and in the Dynamic Island.
 */
const VCProsCardLiveActivity = (props: VCProsCardLiveActivityProps) => {
  'widget';
  const name = props.cardName || 'My Card';

  const qr = (side: number) =>
    props.qrImageUri ? (
      <Image
        uiImage={props.qrImageUri}
        modifiers={[
          resizable(),
          frame({ width: side, height: side }),
          padding({ all: 4 }),
          background('#FFFFFF'),
          cornerRadius(10),
        ]}
      />
    ) : (
      <Image systemName="qrcode" size={side * 0.7} color="#FFFFFF" />
    );

  return {
    banner: (
      <HStack
        alignment="center"
        spacing={14}
        modifiers={[padding({ all: 14 }), activityBackgroundTint('#020617')]}
      >
        {qr(96)}
        <VStack alignment="leading" spacing={4}>
          <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle('#38BDF8')]}>VC PROS</Text>
          <Text modifiers={[font({ weight: 'semibold', size: 17 }), foregroundStyle('#FFFFFF'), lineLimit(2)]}>{name}</Text>
          <Text modifiers={[font({ weight: 'medium', size: 12 }), foregroundStyle('#94A3B8')]}>Scan to connect</Text>
        </VStack>
        <Spacer />
      </HStack>
    ),
    compactLeading: <Image systemName="qrcode" size={16} color="#38BDF8" />,
    compactTrailing: (
      <Text modifiers={[font({ weight: 'semibold', size: 12 }), foregroundStyle('#FFFFFF')]}>VC Pros</Text>
    ),
    minimal: <Image systemName="qrcode" size={16} color="#38BDF8" />,
    expandedLeading: (
      <VStack alignment="leading" spacing={4} modifiers={[padding({ leading: 6, top: 6 })]}>
        <Text modifiers={[font({ weight: 'bold', size: 14 }), foregroundStyle('#38BDF8')]}>VC PROS</Text>
        <Text modifiers={[font({ weight: 'semibold', size: 15 }), foregroundStyle('#FFFFFF'), lineLimit(2)]}>{name}</Text>
        <Text modifiers={[font({ weight: 'medium', size: 12 }), foregroundStyle('#94A3B8')]}>Scan to connect</Text>
      </VStack>
    ),
    expandedTrailing: qr(84),
  };
};

export default createLiveActivity<VCProsCardLiveActivityProps>('VCProsCardLiveActivity', VCProsCardLiveActivity);
