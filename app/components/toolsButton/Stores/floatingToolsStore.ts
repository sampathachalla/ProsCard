import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_FLOATING_TOOLS, MAX_QUICK_TOOLS } from '../toolDefinitions';
import type { FloatingToolId } from '../types';

export type NormalizedToolPosition = {
  x: number;
  y: number;
};

type FloatingToolsState = {
  enabled: boolean;
  enabledTools: FloatingToolId[];
  hydrated: boolean;
  position: NormalizedToolPosition;
  setEnabled: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  setPosition: (position: NormalizedToolPosition) => void;
  toggleTool: (toolId: FloatingToolId) => void;
};

export const useFloatingToolsStore = create<FloatingToolsState>()(
  persist(
    (set) => ({
      enabled: true,
      enabledTools: DEFAULT_FLOATING_TOOLS,
      hydrated: false,
      position: { x: 1, y: 0.55 },
      setEnabled: (enabled) => set({ enabled }),
      setHydrated: (hydrated) => set({ hydrated }),
      setPosition: (position) => set({ position }),
      toggleTool: (toolId) =>
        set((state) => {
          if (state.enabledTools.includes(toolId)) {
            return { enabledTools: state.enabledTools.filter((id) => id !== toolId) };
          }
          if (state.enabledTools.length >= MAX_QUICK_TOOLS) {
            return state;
          }
          return { enabledTools: [...state.enabledTools, toolId] };
        }),
    }),
    {
      migrate: (persistedState) => {
        const state = persistedState as Partial<FloatingToolsState>;
        const previousTools = (state.enabledTools ?? DEFAULT_FLOATING_TOOLS) as string[];
        const renamedTools = previousTools.map((id) => (id === 'share' ? 'wallet' : id));
        return {
          ...state,
          enabledTools: renamedTools.slice(0, MAX_QUICK_TOOLS),
        } as FloatingToolsState;
      },
      name: 'proscard-floating-tools',
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: ({ enabled, enabledTools, position }) => ({ enabled, enabledTools, position }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
    },
  ),
);
