import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, CreditCard, RotateCcw, ScanLine, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { ScannerOverlay } from '../../components/scannerComponents/Components/ScannerOverlay';
import { PermissionGate } from '../../components/scannerComponents/Components/PermissionGate';
import { useScanner } from '../../components/scannerComponents/Hooks/useScanner';
import { PageHeader } from '@/components/uiComponents/PageHeader';

type ScanStage = 'camera' | 'processing' | 'result';

const GUIDANCE = [
  'Place the card on a flat, contrasting surface',
  'Keep all four corners inside the frame',
  'Hold steady and avoid glare',
];

export default function ScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const guidanceOpacity = useRef(new Animated.Value(1)).current;
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [guidanceIndex, setGuidanceIndex] = useState(0);
  const [stage, setStage] = useState<ScanStage>('camera');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [scanData, setScanData] = useState<string | null>(null);
  const { permission, requestPermission, isActive, handleBarcodeScanned, resumeScanning, saveContact } = useScanner();

  useEffect(() => {
    if (stage !== 'camera') return;
    const interval = setInterval(() => {
      Animated.timing(guidanceOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setGuidanceIndex((current) => (current + 1) % GUIDANCE.length);
        Animated.timing(guidanceOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [guidanceOpacity, stage]);

  useEffect(() => () => {
    if (processingTimer.current) clearTimeout(processingTimer.current);
  }, []);

  const finishProcessing = (data: string | null, uri: string | null) => {
    setScanData(data);
    setCapturedUri(uri);
    setStage('processing');
    processingTimer.current = setTimeout(() => setStage('result'), 2200);
  };

  const captureCard = async () => {
    if (!cameraRef.current || stage !== 'camera') return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.82, skipProcessing: false });
      if (photo?.uri) finishProcessing(null, photo.uri);
    } catch {
      // Keep the live preview open if capture is interrupted.
    }
  };

  const processDetectedCode = (data: string) => {
    handleBarcodeScanned(
      { data, type: 'qr', cornerPoints: [], bounds: { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } } },
      () => finishProcessing(data, null)
    );
  };

  const resetScanner = () => {
    if (processingTimer.current) clearTimeout(processingTimer.current);
    processingTimer.current = null;
    setCapturedUri(null);
    setScanData(null);
    setStage('camera');
    resumeScanning();
  };

  const confirmResult = async () => {
    if (scanData) await saveContact(scanData);
    router.replace('/(tabs)/contactsPage');
  };

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <PageHeader title="Scan a Card" subtitle="Capture a card or scan its ProsCard QR code" />
        <PermissionGate onRequestPermission={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topArea, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity accessibilityLabel="Close scanner" onPress={() => router.back()} style={styles.topButton}>
            <ArrowLeft color="#FFFFFF" size={23} />
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>{stage === 'result' ? 'SCAN COMPLETE' : 'SMART CARD SCAN'}</Text>
            <Text style={styles.title}>{stage === 'camera' ? 'Scan a business card' : stage === 'processing' ? 'Reading your card' : 'Card ready to review'}</Text>
          </View>
          {stage !== 'camera' ? (
            <TouchableOpacity accessibilityLabel="Close result" onPress={resetScanner} style={styles.topButton}>
              <X color="#FFFFFF" size={22} />
            </TouchableOpacity>
          ) : <View style={styles.topButtonPlaceholder} />}
        </View>

        {stage === 'camera' ? (
          <View style={styles.guidance}>
            <View style={styles.guidanceIcon}><CreditCard color={Colors.palette.brandCyanLight} size={23} /></View>
            <Animated.Text style={[styles.guidanceText, { opacity: guidanceOpacity }]}>{GUIDANCE[guidanceIndex]}</Animated.Text>
            <View style={styles.dots}>
              {GUIDANCE.map((_, index) => <View key={index} style={[styles.dot, index === guidanceIndex && styles.activeDot]} />)}
            </View>
          </View>
        ) : stage === 'processing' ? (
          <View style={styles.processingCopy}>
            <ActivityIndicator color={Colors.palette.brandCyanLight} />
            <Text style={styles.processingText}>Detecting contact details and links…</Text>
          </View>
        ) : (
          <View style={styles.resultSummary}>
            <View style={styles.successIcon}><Check color="#FFFFFF" size={18} strokeWidth={3} /></View>
            <Text style={styles.resultSummaryText}>{scanData ? 'ProsCard link detected successfully' : 'Card image captured successfully'}</Text>
          </View>
        )}
      </View>

      <View style={[styles.cameraSheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.previewArea}>
          {stage === 'camera' ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={isActive ? ({ data }) => processDetectedCode(data) : undefined}
            />
          ) : capturedUri ? (
            <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.detectedPlaceholder}>
              <ScanLine color={Colors.palette.brandCyanLight} size={58} strokeWidth={1.4} />
              <Text style={styles.detectedText}>ProsCard QR detected</Text>
            </View>
          )}

          {stage !== 'result' && <ScannerOverlay isActive={stage === 'camera'} isProcessing={stage === 'processing'} />}

          {stage === 'result' && (
            <View style={styles.resultCard}>
              <View style={styles.resultBadge}><Check color={Colors.palette.successLight} size={22} strokeWidth={3} /></View>
              <Text style={styles.resultTitle}>{scanData ? 'Digital card found' : 'Card photo is ready'}</Text>
              <Text style={styles.resultValue} numberOfLines={3}>
                {scanData ?? 'Review the captured image, then continue to your collected contact cards.'}
              </Text>
              <View style={styles.resultActions}>
                <Pressable onPress={resetScanner} style={styles.secondaryAction}>
                  <RotateCcw color="#FFFFFF" size={18} />
                  <Text style={styles.secondaryActionText}>Retake</Text>
                </Pressable>
                <Pressable onPress={confirmResult} style={styles.primaryAction}>
                  <Check color="#FFFFFF" size={18} strokeWidth={2.6} />
                  <Text style={styles.primaryActionText}>{scanData ? 'Save card' : 'Use photo'}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {stage === 'camera' && (
          <View style={styles.controls}>
            <TouchableOpacity accessibilityLabel="Close scanner" onPress={() => router.back()} style={styles.controlButton}>
              <X color="#FFFFFF" size={23} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Capture card" onPress={captureCard} style={styles.shutterOuter}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <View style={styles.controlButtonPlaceholder} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.palette.midnightBase },
  topArea: { flex: 0.36, paddingHorizontal: 20, paddingBottom: 18, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  topButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  topButtonPlaceholder: { width: 44, height: 44 },
  titleBlock: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  eyebrow: { color: Colors.palette.brandCyanLight, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#FFFFFF', fontSize: 21, fontWeight: '700', marginTop: 5, textAlign: 'center' },
  guidance: { alignItems: 'center', paddingHorizontal: 12 },
  guidanceIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(56,189,248,0.12)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.24)', marginBottom: 12 },
  guidanceText: { color: '#E2E8F0', fontSize: 15, lineHeight: 21, fontWeight: '600', textAlign: 'center', minHeight: 42 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#475569' },
  activeDot: { width: 18, backgroundColor: Colors.palette.brandCyanLight },
  processingCopy: { alignItems: 'center', gap: 12, paddingBottom: 12 },
  processingText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600' },
  resultSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 12 },
  successIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.palette.success, alignItems: 'center', justifyContent: 'center' },
  resultSummaryText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  cameraSheet: { flex: 0.64, backgroundColor: '#0B1220', borderTopLeftRadius: 34, borderTopRightRadius: 34, paddingHorizontal: 12, paddingTop: 10, shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: -8 } },
  sheetHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#475569', alignSelf: 'center', marginBottom: 10 },
  previewArea: { flex: 1, borderRadius: 26, overflow: 'hidden', backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B' },
  detectedPlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#07101F', gap: 14 },
  detectedText: { color: '#CBD5E1', fontSize: 15, fontWeight: '600' },
  controls: { height: 104, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 35 },
  controlButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  controlButtonPlaceholder: { width: 48, height: 48 },
  shutterOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  resultCard: { ...StyleSheet.absoluteFillObject, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,6,23,0.86)' },
  resultBadge: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(74,222,128,0.14)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.34)' },
  resultTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 16 },
  resultValue: { color: '#CBD5E1', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  secondaryAction: { flex: 1, height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: 'rgba(15,23,42,0.86)' },
  secondaryActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  primaryAction: { flex: 1, height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.palette.primaryCta },
  primaryActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
