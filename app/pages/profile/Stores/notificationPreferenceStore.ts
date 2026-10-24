import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type NotificationPreferenceState = {
  enabled: boolean;
  hydrated: boolean;
  setEnabled: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useNotificationPreferenceStore = create<NotificationPreferenceState>()(
  persist(
    (set) => ({
      enabled: true,
      hydrated: false,
      setEnabled: (enabled) => set({ enabled }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'proscard-notification-preference',
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: ({ enabled }) => ({ enabled }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
