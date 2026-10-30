import { AccessoryWidgetBackground, Image, ZStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  frame,
  padding,
  resizable,
  widgetAccentedRenderingMode,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type VCProsCardWidgetProps = {
  cardName: string;
  openUrl?: string;
  qrImageUri?: string;
  shareUrl: string;
};

const VCProsCardWidget = (
  props: VCProsCardWidgetProps,
  environment: WidgetEnvironment,
) => {
  'widget';
  const url = props.openUrl || 'vcpros:///(tabs)/homepage';

  // Lock Screen families render in vibrant (monochrome) mode over the wallpaper,
  // so they skip the brand colors and let the system tint the QR.
  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}>
        <AccessoryWidgetBackground />
        {props.qrImageUri ? (
          <Image
            uiImage={props.qrImageUri}
            modifiers={[resizable(), padding({ all: 6 }), widgetAccentedRenderingMode('fullColor')]}
          />
        ) : (
          <Image systemName="qrcode" size={34} />
        )}
      </ZStack>
    );
  }

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <ZStack
        modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}
      >
        {props.qrImageUri ? (
          <Image
            uiImage={props.qrImageUri}
            modifiers={[
              resizable(),
              frame({ width: 64, height: 64 }),
              widgetAccentedRenderingMode('fullColor'),
            ]}
          />
        ) : (
          <Image systemName="qrcode" size={52} />
        )}
      </ZStack>
    );
  }

  const medium = environment.widgetFamily === 'systemMedium';
  return (
    <ZStack
      modifiers={[
        containerBackground('#FFFFFF', 'widget'),
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
        padding({ all: 10 }),
        widgetURL(url),
      ]}
    >
      {props.qrImageUri ? (
        <Image
          uiImage={props.qrImageUri}
          modifiers={[
            resizable(),
            frame({ width: medium ? 148 : 136, height: medium ? 148 : 136 }),
            widgetAccentedRenderingMode('fullColor'),
          ]}
        />
      ) : (
        <Image systemName="qrcode" size={medium ? 120 : 108} color="#020617" />
      )}
    </ZStack>
  );
};

export default createWidget<VCProsCardWidgetProps>('VCProsCardWidget', VCProsCardWidget, {
  cardName: 'My VC Card',
  openUrl: 'vcpros:///(tabs)/homepage',
  shareUrl: '',
});
