import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, Check, ChevronLeft, ImagePlus, PencilLine, RefreshCw, RotateCcw, ScanLine, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import {
  CardScannerView,
  isCardRectangleDetectorAvailable,
  type CardScannerViewRef,
  type CardScanState,
} from '@/modules/card-rectangle-detector';
import { PermissionGate } from '../components/scannerComponents/Components/PermissionGate';
import { ScannerOverlay } from '../components/scannerComponents/Components/ScannerOverlay';
import { useScanner } from '../components/scannerComponents/Hooks/useScanner';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { useCardCapture } from '../components/scannerComponents/Hooks/useCardCapture';
import { useCardReader } from '../components/scannerComponents/Hooks/useCardReader';
import { isDocumentScannerAvailable } from '../components/scannerComponents/Services/cardCaptureService';
import { saveScanResult, type ScanResult } from '../components/scannerComponents/Services/scanHandoff';
import type { CapturedCard } from '../components/scannerComponents/types/scanner.types';
import { lookupScannedCard } from '../components/scannerComponents/Services/scannerService';
import type { SharedCard } from '@/components/sharingComponents/Services/sharingService';

type ScanStage = 'camera' | 'processing' | 'result';

/** iOS development builds find the card live in the camera with Apple Vision. */
const liveCardDetection = isCardRectangleDetectorAvailable();

const CARD_HINTS: Record<CardScanState, string> = {
  none: 'Point the camera at a business card',
  detected: 'Hold steady…',
  steady: 'Capturing…',
};
/** Why a captured photo could not go straight to review. */
type PhotoIssue = { kind: 'notACard' | 'failed'; title: string; message: string };

export default function ScannerScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const cardScannerRef = useRef<CardScannerViewRef>(null);
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stage, setStage] = useState<ScanStage>('camera');
  const [scannedCard, setScannedCard] = useState<SharedCard | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<CapturedCard | null>(null);
  const [photoIssue, setPhotoIssue] = useState<PhotoIssue | null>(null);
  const [cardState, setCardState] = useState<CardScanState>('none');
  const [shooting, setShooting] = useState(false);
  /** Width ÷ height of the captured photo, so the scanning animation covers exactly the photo. */
  const [photoAspectRatio, setPhotoAspectRatio] = useState<number>();
  const { permission, requestPermission, isActive, handleBarcodeScanned, resumeScanning, saveContact } = useScanner();
  const { busy: capturing, captureCard: capturePhoto } = useCardCapture();
  const reader = useCardReader();

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

  const finishProcessing = () => {
    setStage('processing');
    processingTimer.current = setTimeout(() => setStage('result'), 2400);
  };

  const openReview = (result: ScanResult) => {
    router.replace({ pathname: '/contacts/new', params: { scanId: saveScanResult(result) } });
  };

  /** Shows the scanning animation over the photo until the backend has read it, then opens the review. */
  const processPhoto = async (card: CapturedCard) => {
    if (card.uri !== photo?.uri) setPhotoAspectRatio(undefined);
    setPhoto(card);
    setPhotoIssue(null);
    setStage('processing');
    const result = await reader.read(card);
    switch (result.status) {
      case 'stale':
        return;
      case 'done':
        openReview({ card: result.card, reading: result.reading });
        return;
      case 'unavailable':
        // Reading is switched off on the server; the user can still type the details.
        openReview({ card, reading: null });
        return;
      case 'notACard':
        setPhotoIssue({
          kind: 'notACard',
          title: 'No business card found',
          message: 'That photo doesn’t show a business card. Retake it or upload a clear photo of the card.',
        });
        setStage('result');
        return;
      case 'failed':
        setPhotoIssue({ kind: 'failed', title: 'Couldn’t read the card', message: result.error });
        setStage('result');
    }
  };

  /** Takes the photo from the live Vision scanner, which crops and straightens it to the card it found. */
  const captureFromCardScanner = async () => {
    if (!cardScannerRef.current || shooting) return;
    setShooting(true);
    try {
      const shot = await cardScannerRef.current.captureAsync();
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await processPhoto({ uri: shot.uri, source: 'camera', edgeDetected: shot.edgeDetected, mimeType: 'image/jpeg' });
    } catch {
      Alert.alert('Capture Failed', 'Could not take the photo. Please try again.');
    } finally {
      setShooting(false);
    }
  };

  /**
   * iOS uses the live Vision scanner (or the plain preview when the build lacks it), never the
   * document scanner; Android uses the native document scanner; Expo Go uses the plain preview.
   */
  const captureCard = async () => {
    if (stage !== 'camera' || capturing || shooting) return;
    if (liveCardDetection) {
      await captureFromCardScanner();
      return;
    }
    if (Platform.OS === 'android' && isDocumentScannerAvailable()) {
      const card = await capturePhoto('scan');
      if (card) await processPhoto(card);
      return;
    }
    if (!cameraRef.current) return;
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.82, skipProcessing: false });
      if (picture?.uri) await processPhoto({ uri: picture.uri, source: 'camera', edgeDetected: false, mimeType: 'image/jpeg' });
    } catch {
      // Keep the live preview open if capture is interrupted.
      Alert.alert('Capture Failed', 'Could not take the photo. Please try again.');
    }
  };

  const openLibrary = async () => {
    if (capturing || stage === 'processing') return;
    const card = await capturePhoto('library');
    if (card) await processPhoto(card);
  };

  // Opened from "Upload card photo" on the contacts page: go straight to the photo library once the
  // screen has finished sliding in (iOS cannot present the picker during that transition).
  useEffect(() => {
    if (source !== 'library') return;
    const timer = setTimeout(() => { void openLibrary(); }, 400);
    return () => clearTimeout(timer);
    // Runs once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processDetectedCode = (data: string) => {
    handleBarcodeScanned(
      { data, type: 'qr', cornerPoints: [], bounds: { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } } },
      () => {
        finishProcessing();
        lookupScannedCard(data)
          .then(setScannedCard)
          .catch((reason) => setLookupError(reason instanceof Error ? reason.message : 'Could not read this card.'));
      }
    );
  };

  // Captures by itself once the card has been held still in the outline.
  useEffect(() => {
    if (liveCardDetection && cardState === 'steady' && stage === 'camera' && !capturing) void captureFromCardScanner();
    // Fires on reaching the steady state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardState]);

  const resetScanner = () => {
    if (processingTimer.current) clearTimeout(processingTimer.current);
    processingTimer.current = null;
    reader.reset();
    setPhoto(null);
    setPhotoIssue(null);
    setScannedCard(null);
    setLookupError(null);
    setCardState('none');
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

  // Library uploads work without camera access, so keep showing their progress.
  if (!permission.granted && !photo) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <PageHeader title="Scan a Card" subtitle="Capture a card or scan its ProsCard QR code" />
        <PermissionGate canAskAgain={permission.canAskAgain} onRequestPermission={requestPermission} />
      </View>
    );
  }

  const controlsBottom = Math.max(insets.bottom, 12) + 18;

  return (
    <View style={styles.screen}>
      {/* Full-screen camera (or the captured photo) */}
      {stage === 'camera' && liveCardDetection ? (
        <>
          <CardScannerView
            ref={cardScannerRef}
            style={StyleSheet.absoluteFill}
            active={!capturing}
            barcodeScanningEnabled={isActive}
            onCardStateChange={({ nativeEvent }) => setCardState(nativeEvent.state)}
            onBarcodeScanned={({ nativeEvent }) => {
              if (isActive && !shooting) processDetectedCode(nativeEvent.data);
            }}
            onCameraError={({ nativeEvent }) => Alert.alert('Camera unavailable', nativeEvent.message)}
          />
          <View pointerEvents="none" style={[styles.hintPill, { bottom: controlsBottom + 96 }]}>
            <Text style={styles.hintText}>{shooting ? 'Capturing…' : CARD_HINTS[cardState]}</Text>
          </View>
        </>
      ) : stage === 'camera' ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          active={!capturing}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={isActive ? ({ data }) => processDetectedCode(data) : undefined}
        />
      ) : photo ? (
        <>
          <Image
            source={{ uri: photo.uri }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            onLoad={({ source }) => setPhotoAspectRatio(source.width && source.height ? source.width / source.height : undefined)}
          />
          {stage === 'processing' && photoAspectRatio && (
            <ScannerOverlay isActive isProcessing imageAspectRatio={photoAspectRatio} hintBottom={controlsBottom + 64} />
          )}
        </>
      ) : (
        <View style={styles.detectedPlaceholder}>
          <ScanLine color={Colors.palette.brandCyanLight} size={52} strokeWidth={1.4} />
          <Text style={styles.detectedText}>ProsCard QR detected</Text>
        </View>
      )}

      {photo && stage === 'processing' && (
        <View style={[styles.controls, { bottom: controlsBottom }]}>
          <TouchableOpacity accessibilityLabel="Cancel" onPress={resetScanner} style={styles.sideButton}>
            <X color="#FFFFFF" size={22} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      )}

      {photoIssue && stage === 'result' && (
        <View style={styles.resultOverlay}>
          <View style={[styles.resultBadge, styles.warningBadge]}>
            <AlertCircle color={Colors.palette.toggleYellow} size={22} strokeWidth={2.6} />
          </View>
          <Text style={styles.resultTitle}>{photoIssue.title}</Text>
          <Text style={styles.resultValue} numberOfLines={3}>{photoIssue.message}</Text>
          <View style={styles.resultActions}>
            <Pressable onPress={resetScanner} style={styles.secondaryAction}>
              <RotateCcw color="#FFFFFF" size={18} />
              <Text style={styles.secondaryActionText}>Retake</Text>
            </Pressable>
            {photoIssue.kind === 'notACard' ? (
              <Pressable onPress={openLibrary} disabled={capturing} style={styles.primaryAction}>
                <ImagePlus color="#FFFFFF" size={18} />
                <Text style={styles.primaryActionText}>Upload</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => processPhoto(photo!)} style={styles.primaryAction}>
                <RefreshCw color="#FFFFFF" size={18} />
                <Text style={styles.primaryActionText}>Retry</Text>
              </Pressable>
            )}
          </View>
          {photoIssue.kind === 'failed' ? (
            <Pressable onPress={() => openReview({ card: photo!, reading: null })} style={styles.textAction}>
              <PencilLine color="#CBD5E1" size={15} />
              <Text style={styles.textActionText}>Enter details manually</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {stage === 'result' && !photo && (
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
        <View style={[styles.controls, { bottom: controlsBottom }]}>
          <TouchableOpacity accessibilityLabel="Go back" onPress={close} style={styles.sideButton}>
            <ChevronLeft color="#FFFFFF" size={26} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Scan business card"
            disabled={capturing || shooting}
            onPress={captureCard}
            style={[styles.shutterOuter, (capturing || shooting) && { opacity: 0.5 }]}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity accessibilityLabel="Upload card photo" disabled={capturing} onPress={openLibrary} style={styles.sideButton}>
            <ImagePlus color="#FFFFFF" size={22} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hintPill: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(28,28,30,0.72)',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
  warningBadge: {
    backgroundColor: 'rgba(250,204,21,0.14)',
    borderColor: 'rgba(250,204,21,0.34)',
  },
  textAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 6,
  },
  textActionText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
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
