// components/scannerComponents/Hooks/useScanner.ts
import { useState } from 'react';
import { useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { saveScannedContact } from '../Services/scannerService';

export function useScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(true);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const handleBarcodeScanned = (
    result: BarcodeScanningResult,
    onScanned: (data: string) => void
  ) => {
    if (!isActive) return;
    setIsActive(false);
    setLastScan(result.data);
    onScanned(result.data);
  };

  const resumeScanning = () => setIsActive(true);

  const saveContact = async (data: string) => {
    await saveScannedContact(data);
    setIsActive(true);
  };

  return {
    permission,
    requestPermission,
    isActive,
    lastScan,
    handleBarcodeScanned,
    resumeScanning,
    saveContact,
  };
}
