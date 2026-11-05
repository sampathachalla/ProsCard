import { create } from 'zustand';

type ActiveCardState = {
  /** The card the user is on, shared by Home and Share so each opens where the other left off. */
  activeCardId: string | null;
  setActiveCardId: (cardId: string) => void;
};

export const useActiveCardStore = create<ActiveCardState>()((set) => ({
  activeCardId: null,
  setActiveCardId: (activeCardId) => set({ activeCardId }),
}));

/** Position of the active card; the first card when none is chosen or the chosen one was deleted. */
export function resolveActiveCardIndex(cards: readonly { id: string }[], activeCardId: string | null): number {
  return Math.max(0, cards.findIndex((card) => card.id === activeCardId));
}
