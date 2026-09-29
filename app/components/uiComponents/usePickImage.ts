import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type PickImageOptions = {
  aspect?: [number, number];
  allowsEditing?: boolean;
};

export async function pickImageFromLibrary(options: PickImageOptions = {}): Promise<string | null> {
  const { aspect, allowsEditing = true } = options;

  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo library access in Settings to upload images for your card.',
      );
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing,
    aspect,
    quality: 0.88,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}
