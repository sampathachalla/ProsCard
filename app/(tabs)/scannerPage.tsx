// app/(tabs)/scannerPage.tsx
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { RefreshCw } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { ScannerOverlay } from '../../components/scannerComponents/Components/ScannerOverlay';
import { PermissionGate } from '../../components/scannerComponents/Components/PermissionGate';
import { useScanner } from '../../components/scannerComponents/Hooks/useScanner';
import { PageHeader } from '@/components/uiComponents/PageHeader';

export default function ScannerScreen() {
  const {
    permission,
    requestPermission,
    isActive,
    lastScan,
    handleBarcodeScanned,
    resumeScanning,
    saveContact,
  } = useScanner();

  const onScanned = (data: string) => {
    Alert.alert(
      'Card scanned',
      `Found a ProsCard link:\n${data}`,
      [
        { text: 'Scan again', onPress: resumeScanning },
        {
          text: 'Save contact',
          onPress: async () => {
            await saveContact(data);
            Alert.alert('Saved', 'Contact added to your Contact Cards.');
          },
        },
      ]
    );
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <PageHeader title="Scan a Card" subtitle="Point your camera at a ProsCard QR code" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <PageHeader title="Scan a Card" subtitle="Point your camera at a ProsCard QR code" />
        <PermissionGate onRequestPermission={requestPermission} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="Scan a Card" subtitle="Point your camera at a ProsCard QR code" />

      <View className="flex-1 mx-6 mt-4 mb-8 rounded-3xl overflow-hidden">
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={isActive ? (result) => handleBarcodeScanned(result, onScanned) : undefined}
        />
        <ScannerOverlay isActive={isActive} />
      </View>

      {lastScan && (
        <TouchableOpacity
          className="mx-6 mb-6 bg-card dark:bg-dark-card rounded-2xl px-4 py-3 flex-row items-center justify-between"
          onPress={resumeScanning}
        >
          <Text className="text-textMuted dark:text-dark-textMuted text-xs" numberOfLines={1}>
            Last scan: {lastScan}
          </Text>
          <RefreshCw color={Colors.light.tint} size={18} strokeWidth={2.2} />
        </TouchableOpacity>
      )}
    </View>
  );
}
