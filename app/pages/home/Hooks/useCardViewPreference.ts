import { useEffect } from 'react';
import { useCardViewPreferenceStore } from '../Stores/cardViewPreferenceStore';

export function useCardViewPreference() {
  const store = useCardViewPreferenceStore();

  useEffect(() => {
    if (!useCardViewPreferenceStore.persist.hasHydrated()) {
      void useCardViewPreferenceStore.persist.rehydrate();
    }
  }, []);

  return store;
}
