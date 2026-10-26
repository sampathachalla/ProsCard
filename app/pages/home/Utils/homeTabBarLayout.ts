/** Matches `tabBarLayoutHeight` in app/(tabs)/_layout.tsx */
export function getHomeTabBarLayoutHeight(bottomSafeInset: number) {
  return 96 + Math.max(bottomSafeInset, 8);
}
