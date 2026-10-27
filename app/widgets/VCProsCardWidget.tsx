import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  clipShape,
  containerBackground,
  font,
  foregroundStyle,
  frame,
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
        widgetURL(props.shareUrl || 'vcpros://sharePage'),
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
