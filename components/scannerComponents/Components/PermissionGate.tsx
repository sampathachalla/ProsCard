// components/scannerComponents/PermissionGate.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function PermissionGate({ onRequestPermission }: { onRequestPermission: () => void }) {
  return (
    <View className="flex-1 bg-background dark:bg-dark-background items-center justify-center px-8">
      <Ionicons name="camera-outline" size={56} color="#7A7A7A" />
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
