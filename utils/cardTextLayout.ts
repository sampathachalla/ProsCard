export function getResponsiveTaglineLimit(viewportWidth: number): number {
  const usableWidth = Math.min(720, Math.max(260, viewportWidth - 48));
  return Math.min(72, Math.max(32, Math.floor((usableWidth - 32) / 7)));
}

export function fitTaglineToViewport(tagline: string, viewportWidth: number): string {
  return tagline.trim().slice(0, getResponsiveTaglineLimit(viewportWidth));
}

export function getResponsiveAccreditationLimit(viewportWidth: number): number {
  const usableWidth = Math.min(720, Math.max(260, viewportWidth - 48));
  return Math.min(48, Math.max(24, Math.floor(usableWidth / 9)));
}

export function fitAccreditationsToViewport(value: string, viewportWidth: number): string {
  return value.trim().slice(0, getResponsiveAccreditationLimit(viewportWidth));
}
