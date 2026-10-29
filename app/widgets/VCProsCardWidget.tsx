import { AccessoryWidgetBackground, HStack, Image, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  clipShape,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  resizable,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type VCProsCardWidgetProps = {
  cardName: string;
  qrImageUri?: string;
  shareUrl: string;
};

const VCProsCardWidget = (
  props: VCProsCardWidgetProps,
  environment: WidgetEnvironment,
) => {
  'widget';
  const url = props.shareUrl || 'vcpros://sharePage';

  // Lock Screen families render in vibrant (monochrome) mode over the wallpaper,
  // so they skip the brand colors and let the system tint the QR.
  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}>
        <AccessoryWidgetBackground />
        {props.qrImageUri ? (
          <Image uiImage={props.qrImageUri} modifiers={[resizable(), padding({ all: 6 })]} />
        ) : (
          <Image systemName="qrcode" size={34} />
        )}
      </ZStack>
    );
  }

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <HStack
        alignment="center"
        spacing={8}
        modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}
      >
        {props.qrImageUri ? (
          <Image uiImage={props.qrImageUri} modifiers={[resizable(), frame({ width: 58, height: 58 })]} />
        ) : (
          <Image systemName="qrcode" size={40} />
        )}
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={[font({ weight: 'bold', size: 13 })]}>VC PROS</Text>
          <Text modifiers={[font({ weight: 'semibold', size: 12 }), lineLimit(1)]}>{props.cardName || 'My Card'}</Text>
          <Text modifiers={[font({ weight: 'medium', size: 11 })]}>Scan to connect</Text>
        </VStack>
        <Spacer />
      </HStack>
    );
  }

  const medium = environment.widgetFamily === 'systemMedium';
  return (
    <HStack
      alignment="center"
      spacing={medium ? 16 : 0}
      modifiers={[
        containerBackground('#020617', 'widget'),
        clipShape('containerRelativeShape'),
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
        padding({ all: 14 }),
        widgetURL(url),
      ]}
    >
      <VStack alignment="leading" spacing={4}>
        <Text modifiers={[font({ weight: 'bold', size: medium ? 18 : 14 }), foregroundStyle('#38BDF8')]}>VC PROS</Text>
        {medium ? (
          <Text modifiers={[font({ weight: 'semibold', size: 14 }), foregroundStyle('#FFFFFF')]}> {props.cardName || 'My Card'} </Text>
        ) : null}
        <Text modifiers={[font({ weight: 'medium', size: 11 }), foregroundStyle('#94A3B8')]}>Scan to connect</Text>
      </VStack>
      <Spacer />
      {props.qrImageUri ? (
        <Image
          uiImage={props.qrImageUri}
          modifiers={[resizable(), frame({ width: medium ? 112 : 96, height: medium ? 112 : 96 })]}
        />
      ) : (
        <Image systemName="qrcode" size={70} color="#FFFFFF" />
      )}
    </HStack>
  );
};

export default createWidget<VCProsCardWidgetProps>('VCProsCardWidget', VCProsCardWidget, {
  cardName: 'My VC Card',
  shareUrl: 'vcpros://sharePage',
});
