/** Card tags always apply preset layouts and themes (no profile toggle). */
export function useCardTagDesignPreference() {
  return {
    enabled: true,
    hydrated: true,
    setEnabled: () => {},
  };
}
