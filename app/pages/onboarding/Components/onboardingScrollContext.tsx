import { createContext, useContext } from 'react';

export type OnboardingScrollApi = {
  ensureFocusedVisible: (target?: number) => void;
};

export const OnboardingScrollContext = createContext<OnboardingScrollApi | null>(null);

export function useOnboardingScroll(): OnboardingScrollApi | null {
  return useContext(OnboardingScrollContext);
}
