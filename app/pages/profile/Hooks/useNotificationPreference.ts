import { useEffect } from 'react';
import { useNotificationPreferenceStore } from '../Stores/notificationPreferenceStore';

export function useNotificationPreference() {
  const store = useNotificationPreferenceStore();

  useEffect(() => {
    if (!useNotificationPreferenceStore.persist.hasHydrated()) {
      void useNotificationPreferenceStore.persist.rehydrate();
    }
  }, []);

  return store;
}
