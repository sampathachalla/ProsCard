import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, ImagePlus, RotateCcw, ScanLine } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { PermissionGate } from '../components/scannerComponents/Components/PermissionGate';
import { ScannerTopPanel } from '../components/scannerComponents/Components/ScannerTopPanel';
import { useScanner } from '../components/scannerComponents/Hooks/useScanner';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { useCardCapture } from '../components/scannerComponents/Hooks/useCardCapture';
import { isDocumentScannerAvailable } from '../components/scannerComponents/Services/cardCaptureService';
import { lookupScannedCard } from '../components/scannerComponents/Services/scannerService';
import type { SharedCard } from '@/components/sharingComponents/Services/sharingService';

type ScanStage = 'camera' | 'processing' | 'result';

export default function ScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stage, setStage] = useState<ScanStage>('camera');
  const [scanData, setScanData] = useState<string | null>(null);
  const [scannedCard, setScannedCard] = useState<SharedCard | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { permission, requestPermission, isActive, handleBarcodeScanned, resumeScanning, saveContact } = useScanner();
  const { busy: capturing, startContactFromCard, openNewContact } = useCardCapture();

  useEffect(
    () => () => {
      if (processingTimer.current) clearTimeout(processingTimer.current);
    },
    []
  );

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/homepage');
  };

  const finishProcessing = (data: string) => {
    setScanData(data);
    setStage('processing');
    processingTimer.current = setTimeout(() => setStage('result'), 2400);
  };

  /** Photos go to the new-contact form; the native scanner detects the card edges when available. */
  const captureCard = async () => {
    if (stage !== 'camera' || capturing) return;
    if (isDocumentScannerAvailable()) {
      await startContactFromCard('scan', { replace: true });
      return;
    }
    // Expo Go has no native scanner, so fall back to a plain photo from the live preview.
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.82, skipProcessing: false });
      if (photo?.uri) openNewContact({ uri: photo.uri, source: 'camera', edgeDetected: false, mimeType: 'image/jpeg' }, { replace: true });
    } catch {
      // Keep the live preview open if capture is interrupted.
      Alert.alert('Capture Failed', 'Could not take the photo. Please try again.');
    }
  };

  const openLibrary = async () => {
    if (stage !== 'camera' || capturing) return;
    await startContactFromCard('library', { replace: true });
  };

  const processDetectedCode = (data: string) => {
    handleBarcodeScanned(
      { data, type: 'qr', cornerPoints: [], bounds: { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } } },
      () => {
        finishProcessing(data);
        lookupScannedCard(data)
          .then(setScannedCard)
          .catch((reason) => setLookupError(reason instanceof Error ? reason.message : 'Could not read this card.'));
      }
    );
  };

  const resetScanner = () => {
    if (processingTimer.current) clearTimeout(processingTimer.current);
    processingTimer.current = null;
    setScanData(null);
    setScannedCard(null);
    setLookupError(null);
    setStage('camera');
    resumeScanning();
  };

  const confirmResult = async () => {
    if (!scannedCard || saving) return;
    setSaving(true);
    try {
      await saveContact(scannedCard);
    } catch (reason) {
      Alert.alert('Save Failed', reason instanceof Error ? reason.message : 'Could not save this contact. Please try again.');
      return;
    } finally {
      setSaving(false);
    }
    router.replace('/(tabs)/contactsPage');
  };

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <PageHeader title="Scan a Card" subtitle="Capture a card or scan its ProsCard QR code" />
        <PermissionGate canAskAgain={permission.canAskAgain} onRequestPermission={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Top: status / processing animation */}
      <SafeAreaView edges={['top']} style={styles.topPane}>
        <ScannerTopPanel stage={stage} hasScanData={Boolean(scanData)} />
      </SafeAreaView>

      {/* Bottom: live camera */}
      <View style={[styles.bottomPane, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.cameraCard}>
          {stage === 'camera' ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              active={!capturing}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={isActive ? ({ data }) => processDetectedCode(data) : undefined}
            />
          ) : (
            <View style={styles.detectedPlaceholder}>
              <ScanLine color={Colors.palette.brandCyanLight} size={52} strokeWidth={1.4} />
              <Text style={styles.detectedText}>ProsCard QR detected</Text>
            </View>
          )}

          {stage === 'result' && (
            <View style={styles.resultOverlay}>
              <View style={styles.resultBadge}>
                <Check color={Colors.palette.successLight} size={22} strokeWidth={3} />
              </View>
              <Text style={styles.resultTitle}>
                {lookupError ? 'Card not recognized' : scannedCard ? scannedCard.name : 'Looking up card…'}
              </Text>
              <Text style={styles.resultValue} numberOfLines={3}>
                {lookupError ?? (scannedCard ? [scannedCard.title, scannedCard.company].filter(Boolean).join(' · ') : ' ')}
              </Text>
              <View style={styles.resultActions}>
                <Pressable onPress={resetScanner} style={styles.secondaryAction}>
                  <RotateCcw color="#FFFFFF" size={18} />
                  <Text style={styles.secondaryActionText}>Retake</Text>
                </Pressable>
                <Pressable
                  onPress={confirmResult}
                  disabled={!scannedCard || saving}
                  style={[styles.primaryAction, (!scannedCard || saving) && { opacity: 0.5 }]}
                >
                  <Check color="#FFFFFF" size={18} strokeWidth={2.6} />
                  <Text style={styles.primaryActionText}>{saving ? 'Saving…' : 'Save card'}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {stage === 'camera' && (
            <View style={styles.controls}>
              <TouchableOpacity accessibilityLabel="Go back" onPress={close} style={styles.sideButton}>
                <ChevronLeft color="#FFFFFF" size={26} strokeWidth={2.2} />
              </TouchableOpacity>

              <TouchableOpacity accessibilityLabel="Scan business card" disabled={capturing} onPress={captureCard} style={[styles.shutterOuter, capturing && { opacity: 0.5 }]}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <TouchableOpacity accessibilityLabel="Upload card photo" disabled={capturing} onPress={openLibrary} style={styles.sideButton}>
                <ImagePlus color="#FFFFFF" size={22} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.palette.midnightBase,
  },
  topPane: {
    flex: 0.42,
    paddingTop: 12,
  },
  bottomPane: {
    flex: 0.58,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  cameraCard: {
    flex: 1,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  detectedPlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    gap: 12,
  },
  detectedText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28,28,30,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.82)',
  },
  resultBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74,222,128,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.34)',
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  resultValue: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  secondaryAction: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: 'rgba(28,28,30,0.9)',
  },
  secondaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryAction: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.palette.primaryCta,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
