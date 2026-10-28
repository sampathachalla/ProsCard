import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type EditorPreferenceState = {
  /** When on, Business / Personal / etc. apply preset layouts and colors. */
  cardTagDesignEnabled: boolean;
  glassmorphicEditorEnabled: boolean;
  logoThemesEnabled: boolean;
  sectionHighlightEnabled: boolean;
  hydrated: boolean;
  setCardTagDesignEnabled: (enabled: boolean) => void;
  setGlassmorphicEditorEnabled: (enabled: boolean) => void;
  setLogoThemesEnabled: (enabled: boolean) => void;
  setSectionHighlightEnabled: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useEditorPreferenceStore = create<EditorPreferenceState>()(
  persist(
    (set) => ({
      cardTagDesignEnabled: true,
      glassmorphicEditorEnabled: true,
      logoThemesEnabled: true,
      sectionHighlightEnabled: true,
      hydrated: false,
      setCardTagDesignEnabled: (cardTagDesignEnabled) => set({ cardTagDesignEnabled }),
      setGlassmorphicEditorEnabled: (glassmorphicEditorEnabled) => set({ glassmorphicEditorEnabled }),
      setLogoThemesEnabled: (logoThemesEnabled) => set({ logoThemesEnabled }),
      setSectionHighlightEnabled: (sectionHighlightEnabled) => set({ sectionHighlightEnabled }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'proscard-editor-preferences',
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: ({
        cardTagDesignEnabled,
        glassmorphicEditorEnabled,
        logoThemesEnabled,
        sectionHighlightEnabled,
      }) => ({
        cardTagDesignEnabled,
        glassmorphicEditorEnabled,
        logoThemesEnabled,
        sectionHighlightEnabled,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persisted, version) => {
        const state = persisted as Partial<EditorPreferenceState>;
        if (version < 3) {
          return {
            ...state,
            cardTagDesignEnabled: state.cardTagDesignEnabled ?? true,
            logoThemesEnabled: state.logoThemesEnabled ?? true,
          };
        }
        return state as EditorPreferenceState;
      },
    },
  ),
);
