import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from 'expo-router';

/**
 * Sends the Android back button through a screen's own back handler, and turns off the iOS swipe-back
 * while it has unsaved changes, so neither gesture skips its "Discard changes?" prompt.
 */
export function useGuardedBack(hasUnsavedChanges: boolean, onBack: () => void) {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !hasUnsavedChanges });
  }, [hasUnsavedChanges, navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onBack();
        return true;
      });
      return () => subscription.remove();
    }, [onBack]),
  );
}
