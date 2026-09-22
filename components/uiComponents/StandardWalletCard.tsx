import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from './BrandLogo';
import { Text } from './Text';

type StandardWalletCardProps = {
  category: string;
  company: string;
  gradient: [string, string];
  logoSource: ImageSourcePropType;
  name: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  title: string;
  width: number;
};

const CARD_ASPECT_RATIO = 1.586;

export function StandardWalletCard({
  category,
  company,
  gradient,
  logoSource,
  name,
  selected = false,
  style,
  title,
  width,
}: StandardWalletCardProps) {
  const height = width / CARD_ASPECT_RATIO;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        { width, height },
        selected ? styles.selectedCard : null,
        style,
      ]}
    >
      <View pointerEvents="none" style={styles.orbitOuter} />
      <View pointerEvents="none" style={styles.orbitInner} />
      <View pointerEvents="none" style={styles.orbitDot} />

      <View style={styles.topRow}>
        <BrandLogo
          accessibilityLabel="MindPROS company logo"
          size="sm"
          source={logoSource}
          variant="wordmark"
        />

        <View style={styles.categoryPill}>
          <Text numberOfLines={1} style={styles.categoryText}>
            {category}
          </Text>
        </View>
      </View>

      <View style={styles.identityBlock}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          numberOfLines={1}
          style={styles.name}
        >
          {name}
        </Text>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.company}>
          {company}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: 'rgba(203, 213, 225, 0.9)',
    borderRadius: 24,
    borderWidth: 1.5,
    elevation: 7,
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },
  categoryPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '48%',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  company: {
    color: 'rgba(255, 255, 255, 0.68)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
  identityBlock: {
    zIndex: 2,
  },
  name: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 26,
  },
  orbitDot: {
    backgroundColor: '#c4b5fd',
    borderRadius: 7,
    height: 14,
    position: 'absolute',
    right: 30,
    top: 82,
    width: 14,
  },
  orbitInner: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 70,
    borderWidth: 1,
    height: 140,
    position: 'absolute',
    right: -28,
    top: -20,
    width: 140,
  },
  orbitOuter: {
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 105,
    borderWidth: 1,
    height: 210,
    position: 'absolute',
    right: -58,
    top: -55,
    width: 210,
  },
  selectedCard: {
    borderColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 2,
    shadowOpacity: 0.3,
    shadowRadius: 18,
  },
  title: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
});
