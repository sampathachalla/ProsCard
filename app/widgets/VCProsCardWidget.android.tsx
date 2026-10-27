import { Column, Image, Row, Spacer, Text } from '@expo/ui/jetpack-compose';
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
  qrImageUri?: string;
  shareUrl: string;
};

const VCProsCardWidget = (props: VCProsCardWidgetProps) => {
  'widget';
  return (
    <Row
      verticalAlignment="center"
      modifiers={[fillMaxSize(), cornerRadius(24), background('#020617'), paddingAll(16)]}
    >
      <Column>
        <Text color="#38BDF8" style={{ typography: 'titleLarge' }}>VC PROS</Text>
        <Text color="#FFFFFF" style={{ typography: 'titleMedium' }}>{props.cardName || 'My Card'}</Text>
        <Text color="#94A3B8" style={{ typography: 'labelMedium' }}>Scan to connect</Text>
      </Column>
      <Spacer />
      {props.qrImageUri ? (
        <Image
          source={{ uri: props.qrImageUri }}
          contentScale="fit"
          contentDescription={`${props.cardName || 'VC Pros'} QR code`}
          modifiers={[size(112, 112)]}
        />
      ) : null}
    </Row>
  );
};

export default createWidget<VCProsCardWidgetProps>('VCProsCardWidget', VCProsCardWidget, {
  cardName: 'My VC Card',
  shareUrl: 'vcpros://sharePage',
});
