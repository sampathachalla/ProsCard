import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CardViewMode } from '../types/cardViewMode';

type CardViewPreferenceState = {
  hydrated: boolean;
  viewMode: CardViewMode;
  setHydrated: (hydrated: boolean) => void;
  setViewMode: (viewMode: CardViewMode) => void;
  toggleViewMode: () => void;
};

export const useCardViewPreferenceStore = create<CardViewPreferenceState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      viewMode: 'carousel',
      setHydrated: (hydrated) => set({ hydrated }),
      setViewMode: (viewMode) => set({ viewMode }),
      toggleViewMode: () =>
        set({
          viewMode: get().viewMode === 'carousel' ? 'stack' : 'carousel',
        }),
    }),
    {
      name: 'proscard-homepage-view-mode',
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: ({ viewMode }) => ({ viewMode }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
