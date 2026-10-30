import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, MapPin } from 'lucide-react-native';
import { MAX_FONT_SCALE, Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';

type Props = {
  eventName: string;
  onPress: () => void;
};

/** Event the badge scans are saved under, over the live camera; tap to change it. */
export function BadgeEventChip({ eventName, onPress }: Props) {
  const missing = !eventName;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={missing ? 'Choose the event' : `Event: ${eventName}. Change event`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, missing && styles.chipMissing, pressed && { opacity: 0.8 }]}
    >
      <MapPin color={missing ? Colors.palette.toggleYellow : '#FFFFFF'} size={16} strokeWidth={2.4} />
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1} style={styles.name}>
        {missing ? 'Choose the event' : eventName}
      </Text>
      <View style={styles.change}>
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.changeText}>{missing ? 'Required' : 'Change'}</Text>
        <ChevronDown color="#CBD5E1" size={14} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'center',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(28, 28, 30, 0.82)',
  },
  chipMissing: {
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.45)',
  },
  name: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  change: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 8,
    marginLeft: 2,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(203, 213, 225, 0.4)',
  },
  changeText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
});
