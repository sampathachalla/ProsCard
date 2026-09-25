import { useEffect } from 'react';
import { useEditorPreferenceStore } from '../Stores/editorPreferenceStore';

export function useEditorPreferences() {
  const store = useEditorPreferenceStore();

  useEffect(() => {
    if (!useEditorPreferenceStore.persist.hasHydrated()) {
      void useEditorPreferenceStore.persist.rehydrate();
    }
  }, []);

  return store;
}
