export function getResponsiveTaglineLimit(viewportWidth: number): number {
  const usableWidth = Math.min(720, Math.max(260, viewportWidth - 48));
  return Math.min(120, Math.max(32, Math.floor((usableWidth - 32) / 7)));
}

export function fitTaglineToViewport(tagline: string, _viewportWidth?: number): string {
  return (tagline || '').trim();
}

export function getResponsiveAccreditationLimit(viewportWidth: number): number {
  const usableWidth = Math.min(720, Math.max(260, viewportWidth - 48));
  return Math.min(100, Math.max(24, Math.floor(usableWidth / 9)));
}

export function fitAccreditationsToViewport(value: string, _viewportWidth?: number): string {
  return (value || '').trim();
}

