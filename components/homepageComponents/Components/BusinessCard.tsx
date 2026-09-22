import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import mindProsLogo from '@/assets/mindpros-logo.png';
import type { BusinessCard as BusinessCardData } from '@/components/cardsComponents/types/card.types';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { QRCodeView } from '@/components/uiComponents/QRCodeView';
import { Text } from '@/components/uiComponents/Text';

type BusinessCardProps = {
  card: BusinessCardData;
  height: number;
  width: number;
};

export function BusinessCard({ card, height, width }: BusinessCardProps) {
  const identityHeight = Math.round(height * 0.40);
  const qrSectionHeight = height - identityHeight;
  const qrSize = Math.min(185, Math.max(145, width * 0.54));
  const qrValue = `https://proscard.app/card/${card.id}`;

  return (
    <View
      accessibilityLabel={`${card.name}, ${card.title} digital business card`}
      style={[
        styles.cardContainer,
        { width, height },
      ]}
    >
      {/* Top Identity Header */}
      <LinearGradient
        colors={card.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientHeader, { height: identityHeight }]}
      >
        {/* Concentric Circular Line Orbit Accents */}
        <View pointerEvents="none" style={styles.orbitOuter} />
        <View pointerEvents="none" style={styles.orbitMiddle} />
        <View pointerEvents="none" style={styles.orbitInner} />
        <View pointerEvents="none" style={styles.orbitDot} />

        {/* Company brand mark */}
        <BrandLogo
          accessibilityLabel="MindPROS company logo"
          size="sm"
          source={mindProsLogo}
          variant="badge"
        />

        {/* Name & Title */}
        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={styles.nameText}
          >
            {card.name}
          </Text>
          <Text numberOfLines={1} style={styles.titleText}>
            {card.title}
          </Text>
        </View>
      </LinearGradient>

      {/* Bottom QR Section */}
      <View style={[styles.qrSection, { height: qrSectionHeight }]}>
        <QRCodeView
          value={qrValue}
          size={qrSize}
          backgroundColor="transparent"
          foregroundColor="#0f172a"
          framed={false}
        />

        <Text style={styles.scanText}>
          Scan to connect
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  gradientHeader: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  orbitOuter: {
    position: 'absolute',
    right: -45,
    top: -45,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  orbitMiddle: {
    position: 'absolute',
    right: -25,
    top: -25,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  orbitInner: {
    position: 'absolute',
    right: -8,
    top: -8,
    width: 95,
    height: 95,
    borderRadius: 47.5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  orbitDot: {
    position: 'absolute',
    right: 28,
    top: 28,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#c4b5fd',
  },
  textContainer: {
    marginTop: 12,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 10,
  },
  scanText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },
});
