import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type EditorPreferenceState = {
  sectionHighlightEnabled: boolean;
  hydrated: boolean;
  setSectionHighlightEnabled: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useEditorPreferenceStore = create<EditorPreferenceState>()(
  persist(
    (set) => ({
      sectionHighlightEnabled: true,
      hydrated: false,
      setSectionHighlightEnabled: (sectionHighlightEnabled) => set({ sectionHighlightEnabled }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'proscard-editor-preferences',
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: ({ sectionHighlightEnabled }) => ({ sectionHighlightEnabled }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
