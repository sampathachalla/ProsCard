// app/(tabs)/scannerPage.tsx
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ScannerOverlay } from '../../components/scannerComponents/Components/ScannerOverlay';
import { PermissionGate } from '../../components/scannerComponents/Components/PermissionGate';
import { useScanner } from '../../components/scannerComponents/Hooks/useScanner';

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
    return <View className="flex-1 bg-background dark:bg-dark-background" />;
  }

  if (!permission.granted) {
    return <PermissionGate onRequestPermission={requestPermission} />;
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View className="px-6 pt-6 pb-2">
        <Text className="text-textPrimary dark:text-dark-textPrimary text-2xl font-extrabold">
          Scan a Card
        </Text>
        <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-1">
          Point your camera at a ProsCard QR code
        </Text>
      </View>

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
          <Ionicons name="refresh" size={18} color={Colors.light.tint} />
        </TouchableOpacity>
      )}
    </View>
  );
}
