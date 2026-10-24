import { useEffect } from 'react';
import { useFloatingToolsStore } from '../Stores/floatingToolsStore';

export function useFloatingTools() {
  const store = useFloatingToolsStore();

  useEffect(() => {
    if (!useFloatingToolsStore.persist.hasHydrated()) {
      void useFloatingToolsStore.persist.rehydrate();
    }
  }, []);

  return store;
}
