// components/scannerComponents/Services/cardCaptureService.ts
import { Alert, Platform, TurboModuleRegistry } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { CapturedCard } from '../types/scanner.types';

/**
 * The document scanner is a native module, so it is missing in Expo Go and on web.
 * Importing the plugin there throws, which is why it is only loaded after this check.
 */
export function isDocumentScannerAvailable(): boolean {
  return Platform.OS !== 'web' && TurboModuleRegistry.get('DocumentScanner') != null;
}

const toFileUri = (path: string) => (/^[a-z]+:/i.test(path) ? path : `file://${path}`);

/** Opens the native scanner (VisionKit / ML Kit), which detects the card edges and returns a cropped image. */
async function scanWithEdgeDetection(): Promise<CapturedCard | null> {
  const { default: DocumentScanner, ScanDocumentResponseStatus } = await import('react-native-document-scanner-plugin');
  const result = await DocumentScanner.scanDocument({ maxNumDocuments: 1, croppedImageQuality: 90 });
  const path = result.scannedImages?.[0];
  if (result.status === ScanDocumentResponseStatus.Cancel || !path) return null;
  return { uri: toFileUri(path), source: 'scanner', edgeDetected: true, mimeType: 'image/jpeg' };
}

function fromPickerResult(result: ImagePicker.ImagePickerResult, source: CapturedCard['source']): CapturedCard | null {
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    source,
    edgeDetected: false,
    mimeType: asset.mimeType ?? undefined,
    fileName: asset.fileName ?? undefined,
  };
}

// iOS only offers a square crop, which would cut a business card, so manual cropping is Android-only.
const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: Platform.OS === 'android',
  quality: 0.88,
};

/** Takes a photo of a card, preferring the edge-detecting scanner and falling back to the system camera. */
export async function scanCard(): Promise<CapturedCard | null> {
  if (isDocumentScannerAvailable()) return scanWithEdgeDetection();
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Camera access needed', 'Allow camera access in Settings to scan business cards.');
    return null;
  }
  return fromPickerResult(await ImagePicker.launchCameraAsync(pickerOptions), 'camera');
}

/** Lets the user choose an existing photo of a card from their library. */
export async function pickCardFromLibrary(): Promise<CapturedCard | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo library access in Settings to upload a business card photo.');
      return null;
    }
  }
  return fromPickerResult(await ImagePicker.launchImageLibraryAsync(pickerOptions), 'library');
}
