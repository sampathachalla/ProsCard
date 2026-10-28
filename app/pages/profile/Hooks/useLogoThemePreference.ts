import { useEffect } from 'react';
import { useEditorPreferenceStore } from '../Stores/editorPreferenceStore';

export function useLogoThemePreference() {
  const enabled = useEditorPreferenceStore((s) => s.logoThemesEnabled);
  const setEnabled = useEditorPreferenceStore((s) => s.setLogoThemesEnabled);
  const hydrated = useEditorPreferenceStore((s) => s.hydrated);

  useEffect(() => {
    if (!useEditorPreferenceStore.persist.hasHydrated()) {
      void useEditorPreferenceStore.persist.rehydrate();
    }
  }, []);

  return { enabled, setEnabled, hydrated };
}
