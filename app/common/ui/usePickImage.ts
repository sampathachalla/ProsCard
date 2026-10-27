import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { registerPendingMedia } from '@/pages/profile/Services/pendingMedia';

export type PickedImage = ImagePicker.ImagePickerAsset;

type PickImageOptions = {
  aspect?: [number, number];
  allowsEditing?: boolean;
};

export async function pickImageFromLibrary(options: PickImageOptions = {}): Promise<string | null> {
  const asset = await pickImageAssetFromLibrary(options);
  return asset?.uri ?? null;
}

export async function pickImageAssetFromLibrary(options: PickImageOptions = {}): Promise<PickedImage | null> {
  const { aspect, allowsEditing = true } = options;

  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      await Linking.openSettings().catch(() => {
        Alert.alert(
          'Photo access needed',
          'Open VC Pros in Settings and allow photo library access to upload images for your card.',
        );
      });
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

  registerPendingMedia(result.assets[0]);
  return result.assets[0];
}

export async function takePhotoAsset(): Promise<PickedImage | null> {
  if (Platform.OS === 'web') return pickImageAssetFromLibrary({ allowsEditing: false });
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    await Linking.openSettings().catch(() => {
      Alert.alert('Camera access needed', 'Open VC Pros in Settings and allow camera access to take a photo.');
    });
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.92,
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  registerPendingMedia(result.assets[0]);
  return result.assets[0];
}
