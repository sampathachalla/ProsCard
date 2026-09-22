// components/scannerComponents/PermissionGate.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';

export function PermissionGate({ onRequestPermission }: { onRequestPermission: () => void }) {
  return (
    <View className="flex-1 bg-background dark:bg-dark-background items-center justify-center px-8">
      <Camera color="#7A7A7A" size={56} strokeWidth={1.8} />
      <Text className="text-textPrimary dark:text-dark-textPrimary text-lg font-bold mt-4 text-center">
        Camera access needed
      </Text>
      <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-2 text-center">
        ProsCard needs your camera to scan QR codes on other business cards.
      </Text>
      <TouchableOpacity
        className="bg-primary dark:bg-dark-primary rounded-full px-6 py-3 mt-6"
        onPress={onRequestPermission}
      >
        <Text className="text-white font-semibold">Grant permission</Text>
      </TouchableOpacity>
    </View>
  );
}
