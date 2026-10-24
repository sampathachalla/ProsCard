import { createContext, useContext, type ReactNode } from 'react';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import type { SharedValue } from 'react-native-reanimated';

const EditorAnimatedPresentationContext = createContext<SharedValue<number> | null>(null);

export function EditorAnimatedPresentationProvider({ children }: { children: ReactNode }) {
  const { animatedIndex } = useBottomSheet();
  return (
    <EditorAnimatedPresentationContext.Provider value={animatedIndex}>
      {children}
    </EditorAnimatedPresentationContext.Provider>
  );
}

export function useEditorAnimatedIndex(): SharedValue<number> {
  const value = useContext(EditorAnimatedPresentationContext);
  if (!value) {
    throw new Error('useEditorAnimatedIndex must be used inside EditorAnimatedPresentationProvider (within the edit bottom sheet).');
  }
  return value;
}
