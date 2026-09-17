// components/scannerComponents/ScannerOverlay.tsx
import { View, Text, StyleSheet } from 'react-native';

export function ScannerOverlay({ isActive }: { isActive: boolean }) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.frame} />
      <Text style={styles.hint}>
        {isActive ? 'Align the QR code within the frame' : 'Card captured'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  frame: {
    width: 220,
    height: 220,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  hint: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
