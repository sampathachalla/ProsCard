import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { IdCard, ScanLine } from 'lucide-react-native';
import { MAX_FONT_SCALE, Text } from '@/common/ui/Text';

export type ScannerKind = 'card' | 'badge';

type ScannerModeBarProps = {
  scanKind: ScannerKind;
  eventName: string;
  topInset: number;
  onScanKindChange: (kind: ScannerKind) => void;
  onEventNameChange: (name: string) => void;
};

function ModeOption({
  label,
  selected,
  onPress,
  Icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  Icon: typeof ScanLine;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.modeOption, selected && styles.modeOptionSelected]}
    >
      <Icon color={selected ? '#FFFFFF' : '#CBD5E1'} size={16} strokeWidth={2.2} />
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.modeLabel, selected && styles.modeLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Card vs event-badge switch shown over the live camera (native scanner and Expo Camera). */
export function ScannerModeBar({
  scanKind,
  eventName,
  topInset,
  onScanKindChange,
  onEventNameChange,
}: ScannerModeBarProps) {
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingTop: topInset + 8 }]}>
      <View style={styles.segment}>
        <ModeOption
          label="Business card"
          selected={scanKind === 'card'}
          onPress={() => onScanKindChange('card')}
          Icon={ScanLine}
        />
        <ModeOption
          label="Event badge"
          selected={scanKind === 'badge'}
          onPress={() => onScanKindChange('badge')}
          Icon={IdCard}
        />
      </View>
      {scanKind === 'badge' ? (
        <TextInput
          value={eventName}
          onChangeText={onEventNameChange}
          placeholder="Event name (required)"
          placeholderTextColor="#94a3b8"
          autoCapitalize="words"
          returnKeyType="done"
          style={styles.eventInput}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    gap: 10,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: 18,
    backgroundColor: 'rgba(28, 28, 30, 0.82)',
  },
  modeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  modeOptionSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
  },
  modeLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  modeLabelSelected: {
    color: '#FFFFFF',
  },
  eventInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(28, 28, 30, 0.82)',
  },
});
