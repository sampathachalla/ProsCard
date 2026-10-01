import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { CaptureTipCaption, CaptureTipIcon, useCaptureTipCycle } from './CaptureTips';

type ScannerTopPanelProps = {
  stage: 'camera' | 'processing' | 'result';
  hasScanData: boolean;
  /** Replaces the default heading, e.g. to explain why a photo could not be used. */
  copy?: { eyebrow: string; title: string; subtitle: string };
};

export function ScannerTopPanel({ stage, hasScanData, copy }: ScannerTopPanelProps) {
  const tips = useCaptureTipCycle(stage === 'camera');

  const title =
    stage === 'processing'
      ? 'Reading your card'
      : stage === 'result'
        ? hasScanData
          ? 'Card detected'
          : 'Photo ready'
        : 'Scan a business card';

  const subtitle =
    stage === 'processing'
      ? 'Extracting contact details and links…'
      : stage === 'result'
        ? hasScanData
          ? 'ProsCard link found successfully'
          : 'Review the capture below, then continue'
        : 'Edges are detected automatically';

  return (
    <View style={styles.panel}>
      <Animated.View entering={FadeIn.duration(280)} style={styles.copy}>
        <Text style={styles.eyebrow}>
          {copy?.eyebrow ?? (stage === 'processing' ? 'PROCESSING' : stage === 'result' ? 'SCAN COMPLETE' : 'SMART CARD SCAN')}
        </Text>
        <Text style={styles.title}>{copy?.title ?? title}</Text>
        <Text style={styles.subtitle}>{copy?.subtitle ?? subtitle}</Text>
      </Animated.View>

      <View style={styles.body}>
        {stage === 'camera' ? (
          <>
            <View style={styles.tipIcon}>
              <CaptureTipIcon tip={tips.tip} size={26} />
            </View>
            <CaptureTipCaption index={tips.index} onSelect={tips.select} />
          </>
        ) : stage === 'processing' ? (
          <View style={styles.processing}>
            <ActivityIndicator color={Colors.palette.brandCyanLight} />
            <Text style={styles.processingText}>Analyzing image</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: Colors.palette.midnightBase,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  copy: {
    alignItems: 'center',
    paddingTop: 8,
  },
  eyebrow: {
    color: Colors.palette.brandCyanLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  tipIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.24)',
  },
  processing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.28)',
  },
  processingText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
});
