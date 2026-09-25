import type { CardFontStyle, CardVisualTheme } from '@/components/cardsComponents/types/card.types';

type SavedSectionThemeMeta = {
  customThemeId?: string;
  customThemeName?: string;
};

type Rgb = { r: number; g: number; b: number };

export type CardThemeColorMode = 'light' | 'dark';

export type CardThemeContrastPalette = {
  mode: CardThemeColorMode;
  primary: string;
  secondary: string;
  subtle: string;
};

export function normalizeHexColor(input: string): string | null {
  const raw = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    const [r, g, b] = raw.split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function parseHexColor(hex: string): Rgb | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const raw = normalized.slice(1);
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

export function hexToRgb(hex: string): Rgb | null {
  return parseHexColor(hex);
}

export function rgbToHex(rgb: Rgb): string {
  return toHex(rgb);
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = parseHexColor(hex);
  if (!rgb) return { h: 210, s: 0.72, v: 0.92 };

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  return { h, s, v: max };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(1, s));
  const val = Math.max(0, Math.min(1, v));
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hue < 60) {
    rp = c;
    gp = x;
  } else if (hue < 120) {
    rp = x;
    gp = c;
  } else if (hue < 180) {
    gp = c;
    bp = x;
  } else if (hue < 240) {
    gp = x;
    bp = c;
  } else if (hue < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return toHex({
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  });
}

function toHex({ r, g, b }: Rgb): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function mixHexColors(colorA: string, colorB: string, weightB: number): string {
  const a = parseHexColor(colorA);
  const b = parseHexColor(colorB);
  if (!a || !b) return normalizeHexColor(colorA) ?? '#2563eb';
  const t = Math.max(0, Math.min(1, weightB));
  return toHex({
    r: a.r * (1 - t) + b.r * t,
    g: a.g * (1 - t) + b.g * t,
    b: a.b * (1 - t) + b.b * t,
  });
}

export function relativeLuminance(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) return 0.5;
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/**
 * Classifies the colors users actually see in the theme preview. Keeping this
 * here gives every card section and the styling picker one shared definition
 * of a light or dark theme.
 */
export function getCardThemeColorMode(
  theme: Pick<CardVisualTheme, 'gradient'> & Partial<Pick<CardVisualTheme, 'backgroundColor'>>,
): CardThemeColorMode {
  const luminance = theme.backgroundColor
    ? relativeLuminance(theme.backgroundColor)
    : (relativeLuminance(theme.gradient[0]) + relativeLuminance(theme.gradient[1])) / 2;
  return luminance < 0.42 ? 'dark' : 'light';
}

/** Readable layout colors for the selected theme category. */
export function getCardThemeContrastPalette(
  theme: Pick<CardVisualTheme, 'gradient'> & Partial<Pick<CardVisualTheme, 'backgroundColor'>>,
): CardThemeContrastPalette {
  const mode = getCardThemeColorMode(theme);
  return mode === 'dark'
    ? { mode, primary: '#f8fafc', secondary: '#cbd5e1', subtle: '#94a3b8' }
    : { mode, primary: '#0f172a', secondary: '#334155', subtle: '#64748b' };
}

export function getGradientContrastPalette(
  gradient: [string, string],
): CardThemeContrastPalette {
  return getCardThemeContrastPalette({ gradient });
}

export function buildCustomSectionTheme(
  gradient: [string, string],
  fontStyle: CardFontStyle = 'modern',
  saved?: Pick<SavedSectionThemeMeta, 'customThemeId' | 'customThemeName'>,
): CardVisualTheme {
  const start = normalizeHexColor(gradient[0]) ?? '#2563eb';
  const end = normalizeHexColor(gradient[1]) ?? '#06b6d4';
  const avgLuminance = (relativeLuminance(start) + relativeLuminance(end)) / 2;
  const dark = avgLuminance < 0.42;

  return {
    id: 'custom',
    gradient: [start, end],
    backgroundColor: mixHexColors(start, dark ? '#020617' : '#ffffff', dark ? 0.55 : 0.82),
    surfaceColor: dark ? mixHexColors(start, '#0f172a', 0.65) : '#ffffff',
    textColor: dark ? '#f8fafc' : '#0f172a',
    mutedTextColor: dark ? mixHexColors(end, '#94a3b8', 0.35) : mixHexColors(end, '#64748b', 0.45),
    accentColor: end,
    fontStyle,
    customThemeId: saved?.customThemeId,
    customThemeName: saved?.customThemeName,
  };
}

export function themeFromSavedSectionTheme(
  saved: { id: string; name: string; gradient: [string, string] },
  fontStyle: CardFontStyle,
): CardVisualTheme {
  return buildCustomSectionTheme(saved.gradient, fontStyle, {
    customThemeId: saved.id,
    customThemeName: saved.name,
  });
}

export function clearSavedThemeMeta(theme: CardVisualTheme): CardVisualTheme {
  const { customThemeId: _a, customThemeName: _b, ...rest } = theme;
  return rest;
}

/** Curated swatches for gradient stops (hue + neutrals). */
export const GRADIENT_COLOR_SWATCHES: string[] = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#78716c',
  '#64748b',
  '#334155',
  '#0f172a',
  '#ffffff',
  '#f8fafc',
  '#020617',
];
