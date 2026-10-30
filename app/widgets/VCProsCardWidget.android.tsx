import { Image, Row } from '@expo/ui/jetpack-compose';
import {
  background,
  cornerRadius,
  fillMaxSize,
  paddingAll,
  size,
} from '@expo/ui/jetpack-compose/modifiers';
import { createWidget } from 'expo-widgets';

export type VCProsCardWidgetProps = {
  cardName: string;
  openUrl?: string;
  qrImageUri?: string;
  shareUrl: string;
};

const VCProsCardWidget = (props: VCProsCardWidgetProps) => {
  'widget';
  return (
    <Row
      horizontalArrangement="center"
      verticalAlignment="center"
      modifiers={[fillMaxSize(), cornerRadius(24), background('#FFFFFF'), paddingAll(12)]}
    >
      {props.qrImageUri ? (
        <Image
          source={{ uri: props.qrImageUri }}
          contentScale="fit"
          contentDescription={`${props.cardName || 'VC Pros'} QR code`}
          modifiers={[size(136, 136)]}
        />
      ) : null}
    </Row>
  );
};

export default createWidget<VCProsCardWidgetProps>('VCProsCardWidget', VCProsCardWidget, {
  cardName: 'My VC Card',
  openUrl: 'vcpros:///(tabs)/homepage',
  shareUrl: '',
});
