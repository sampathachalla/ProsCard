import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type EditorPreferenceState = {
  glassmorphicEditorEnabled: boolean;
  sectionHighlightEnabled: boolean;
  hydrated: boolean;
  setGlassmorphicEditorEnabled: (enabled: boolean) => void;
  setSectionHighlightEnabled: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useEditorPreferenceStore = create<EditorPreferenceState>()(
  persist(
    (set) => ({
      glassmorphicEditorEnabled: true,
      sectionHighlightEnabled: true,
      hydrated: false,
      setGlassmorphicEditorEnabled: (glassmorphicEditorEnabled) => set({ glassmorphicEditorEnabled }),
      setSectionHighlightEnabled: (sectionHighlightEnabled) => set({ sectionHighlightEnabled }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'proscard-editor-preferences',
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: ({ glassmorphicEditorEnabled, sectionHighlightEnabled }) => ({
        glassmorphicEditorEnabled,
        sectionHighlightEnabled,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
    },
  ),
);
