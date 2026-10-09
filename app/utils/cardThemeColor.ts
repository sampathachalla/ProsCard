import {
  type CardFontStyle,
  type CardTemplateId,
  type CardVisualTheme,
  type ResolvedLayoutSlots,
  type ThemePaletteTier,
  getTemplatePaletteTier,
} from '@/components/cardsComponents/types/card.types';

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

export function hexToRgbaString(hex: string, alpha: number): string {
  const rgb = parseHexColor(hex);
  if (!rgb) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
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
  return `#${[clamp(r), clamp(g), clamp(b)].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
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

export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastSafeColor(preferred: string, background: string, fallback: string, minimum = 4.5): string {
  const normalized = normalizeHexColor(preferred);
  return normalized && contrastRatio(normalized, background) >= minimum ? normalized : fallback;
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

export function getGradientContrastPalette(gradient: [string, string]): CardThemeContrastPalette {
  return getCardThemeContrastPalette({ gradient });
}

export function isColorLight(hex: string): boolean {
  return relativeLuminance(hex) >= 0.45;
}

/**
 * Accurately determines if a color string (rgba, rgb, hex, or named) is visually light or dark.
 */
export function isRgbaOrHexLight(color: string): boolean {
  if (!color) return true;
  const clean = color.trim();
  const rgbMatch = clean.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance >= 0.45;
  }
  if (clean.startsWith('#')) {
    return isColorLight(clean);
  }
  return true;
}

/**
 * Returns pure high-contrast primary text color (#ffffff for dark backgrounds, #0f172a for light backgrounds)
 */
export function getContrastTextColor(bgHex: string): string {
  return isColorLight(bgHex) ? '#0f172a' : '#ffffff';
}

/**
 * Returns high-contrast secondary text color (#cbd5e1 for dark backgrounds, #334155 for light backgrounds)
 */
export function getContrastSecondaryColor(bgHex: string): string {
  return isColorLight(bgHex) ? '#334155' : '#cbd5e1';
}

/**
 * Returns high-contrast muted text color (#94a3b8 for dark backgrounds, #64748b for light backgrounds)
 */
export function getContrastMutedColor(bgHex: string): string {
  return isColorLight(bgHex) ? '#64748b' : '#94a3b8';
}

/** Build a palette long enough for the layout tier, using saved theme fields when needed. */
export function themePaletteForLayout(theme: CardVisualTheme, templateId: CardTemplateId): string[] {
  const tier = getTemplatePaletteTier(templateId);
  if (theme.paletteColors && theme.paletteColors.length >= tier) {
    if (tier === 2) {
      return [theme.paletteColors[0], theme.paletteColors[2] ?? theme.paletteColors[1]];
    }
    return theme.paletteColors.slice(0, tier);
  }
  const accent = theme.accentColor;
  const highlight = theme.gradient?.[1] ?? accent;
  if (tier === 2) {
    return [theme.backgroundColor, accent];
  }
  if (tier === 3) {
    return [theme.backgroundColor, theme.surfaceColor, accent];
  }
  return [theme.backgroundColor, theme.surfaceColor, accent, highlight];
}

/** Expand a short preset (e.g. 2 swatches) to the palette length a layout tier expects. */
export function expandPresetColorsForLayoutTier(
  colors: string[],
  layoutTier: ThemePaletteTier,
  fontStyle: CardFontStyle = 'modern',
): string[] {
  if (colors.length >= layoutTier) return colors.slice(0, layoutTier);
  const built = buildMultiTierSectionTheme(colors, fontStyle);
  if (layoutTier === 3) {
    return [built.backgroundColor, built.surfaceColor, built.accentColor];
  }
  if (layoutTier === 4) {
    return [built.backgroundColor, built.surfaceColor, built.accentColor, built.gradient[1] ?? built.accentColor];
  }
  return [built.backgroundColor, built.accentColor];
}

/**
 * Resolves color slots for any section layout template given a theme (2, 3, or 4 colors).
 * Auto-derives missing slots gracefully and computes contrast-safe text and logo backdrops.
 */
export function resolveLayoutColorSlots({
  templateId,
  theme,
}: {
  templateId: CardTemplateId;
  theme: CardVisualTheme;
}): ResolvedLayoutSlots {
  // The active layout's own tier is authoritative: `theme.paletteTier` can be
  // stale after switching to a layout with a different color-tier requirement
  // without also picking a new color theme.
  const tier = getTemplatePaletteTier(templateId);

  const palette = themePaletteForLayout(theme, templateId);

  let baseColor: string;
  let surfaceColor: string;
  let accentColor: string;
  let highlightColor: string;

  if (tier === 2) {
    baseColor = palette[0];
    accentColor = palette[1];
    const isBaseLight = isColorLight(baseColor);
    surfaceColor =
      normalizeHexColor(theme.surfaceColor) ??
      (isBaseLight ? mixHexColors(baseColor, '#ffffff', 0.85) : mixHexColors(baseColor, '#0f172a', 0.75));
    highlightColor = mixHexColors(accentColor, isBaseLight ? '#ffffff' : '#020617', 0.35);
  } else if (tier === 3) {
    baseColor = palette[0];
    surfaceColor = palette[1];
    accentColor = palette[2];
    highlightColor = mixHexColors(accentColor, isColorLight(surfaceColor) ? '#ffffff' : '#020617', 0.4);
  } else {
    // 4 colors
    baseColor = palette[0];
    surfaceColor = palette[1];
    accentColor = palette[2];
    highlightColor = palette[3] || mixHexColors(accentColor, '#ffffff', 0.3);
  }

  // Layout-specific overrides (e.g. Bold hero layout uses gradient)
  const isBold = templateId === 'bold';
  const effectiveBgLuminance = isBold
    ? (relativeLuminance(theme.gradient[0]) + relativeLuminance(theme.gradient[1])) / 2
    : relativeLuminance(baseColor);
  const isDark = effectiveBgLuminance < 0.45;

  const isSurfaceLight = isColorLight(surfaceColor);
  const isBaseLight = isColorLight(baseColor);
  const isGradientLight = (relativeLuminance(theme.gradient[0]) + relativeLuminance(theme.gradient[1])) / 2 >= 0.45;
  const isAccentLight = isColorLight(accentColor);

  // Surface-specific contrast text
  const fallbackSurfacePrimary = isSurfaceLight ? '#0f172a' : '#f8fafc';
  const fallbackSurfaceSecondary = isSurfaceLight ? '#334155' : '#cbd5e1';
  const fallbackSurfaceMuted = isSurfaceLight ? '#475569' : '#cbd5e1';
  let surfaceTextPrimary = contrastSafeColor(theme.textColor, surfaceColor, fallbackSurfacePrimary);
  const surfaceTextSecondary = contrastSafeColor(theme.mutedTextColor, surfaceColor, fallbackSurfaceSecondary);
  const surfaceTextMuted = contrastSafeColor(theme.mutedTextColor, surfaceColor, fallbackSurfaceMuted);

  // Base background-specific contrast text
  const fallbackBgPrimary = isBaseLight ? '#0f172a' : '#f8fafc';
  const fallbackBgSecondary = isBaseLight ? '#334155' : '#cbd5e1';
  const fallbackBgMuted = isBaseLight ? '#475569' : '#cbd5e1';
  let bgTextPrimary = contrastSafeColor(theme.textColor, baseColor, fallbackBgPrimary);
  const bgTextSecondary = contrastSafeColor(theme.mutedTextColor, baseColor, fallbackBgSecondary);
  const bgTextMuted = contrastSafeColor(theme.mutedTextColor, baseColor, fallbackBgMuted);

  // Accent & Gradient contrast text
  const accentText = isAccentLight ? '#0f172a' : '#ffffff';
  const gradientText = isGradientLight ? '#0f172a' : '#ffffff';

  // Default textPrimary / textSecondary matches the main container (surface for standard layouts, gradient for bold)
  const isPrimaryDark = isBold ? !isGradientLight : !isSurfaceLight;
  let textPrimary = isBold ? gradientText : surfaceTextPrimary;
  const textSecondary = isBold ? (isPrimaryDark ? '#cbd5e1' : '#334155') : surfaceTextSecondary;
  const textMuted = isBold ? (isPrimaryDark ? '#cbd5e1' : '#475569') : surfaceTextMuted;

  const textColorOverride = normalizeHexColor(theme.textColorOverride ?? '');
  if (textColorOverride) {
    surfaceTextPrimary = textColorOverride;
    bgTextPrimary = textColorOverride;
    textPrimary = textColorOverride;
  }

  // Tone-on-tone glass badge colors: seamlessly adapts to card base & accent palette
  const cleanAccent = normalizeHexColor(accentColor) ?? '#2563eb';
  const cleanBase = normalizeHexColor(baseColor) ?? '#0a1128';
  const lightLogoGlass = hexToRgbaString(mixHexColors('#ffffff', cleanAccent, 0.06), 0.94);
  const darkLogoGlass = hexToRgbaString(
    mixHexColors(mixHexColors(cleanBase, cleanAccent, 0.14), '#030712', 0.65),
    0.88,
  );
  const logoBackdrop = isSurfaceLight ? darkLogoGlass : lightLogoGlass;
  const logoBorder = isSurfaceLight
    ? hexToRgbaString(cleanAccent, 0.3)
    : hexToRgbaString(mixHexColors(cleanAccent, '#0f172a', 0.25), 0.18);
  const borderColor = isDark ? mixHexColors(accentColor, '#ffffff', 0.15) : mixHexColors(accentColor, '#020617', 0.12);

  return {
    accent: accentColor,
    accentText,
    background: isBold ? theme.gradient[0] : baseColor,
    bgTextMuted,
    bgTextPrimary,
    bgTextSecondary,
    borderColor,
    gradientText,
    highlight: highlightColor,
    isDark,
    logoBackdrop,
    logoBorder,
    surface: surfaceColor,
    surfaceTextMuted,
    surfaceTextPrimary,
    surfaceTextSecondary,
    textMuted,
    textPrimary,
    textSecondary,
  };
}

export type LogoPlacementContext = 'on-cover' | 'on-surface' | 'glass' | 'neon' | 'banner' | 'badge' | 'floating';

export type ResolvedLogoBoxStyle = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export type LogoTone = 'light' | 'dark' | 'auto';

/**
 * Engine-driven styling for company logo containers. Computes dynamic background, border,
 * glass/frosted contrast, and glow/shadow based on the detected logo tone, theme, color slots, and layout context.
 */
export function resolveLogoBoxStyle({
  compact = false,
  logoTone = 'auto',
  placement,
  slots,
  templateId,
  theme,
}: {
  compact?: boolean;
  logoTone?: LogoTone;
  placement?: LogoPlacementContext;
  slots?: ResolvedLayoutSlots;
  templateId?: CardTemplateId;
  theme?: CardVisualTheme;
}): ResolvedLogoBoxStyle {
  const effectiveSlots = slots ?? (theme && templateId ? resolveLayoutColorSlots({ templateId, theme }) : undefined);
  const accent = effectiveSlots?.accent ?? theme?.accentColor ?? '#2563eb';
  const surface = effectiveSlots?.surface ?? theme?.surfaceColor ?? '#ffffff';
  const isSurfaceLight = isColorLight(surface);

  let effectivePlacement = placement;
  if (!effectivePlacement && templateId) {
    switch (templateId) {
      case 'bold':
      case 'spotlight':
        effectivePlacement = 'on-cover';
        break;
      case 'glass':
        effectivePlacement = 'glass';
        break;
      case 'neon':
        effectivePlacement = 'neon';
        break;
      case 'banner':
        effectivePlacement = 'banner';
        break;
      case 'badge':
        effectivePlacement = 'badge';
        break;
      case 'cards':
        effectivePlacement = 'floating';
        break;
      default:
        effectivePlacement = 'on-surface';
    }
  }

  const radius = compact ? 12 : 16;
  const isLogoDark = logoTone === 'dark';
  const isLogoLight = logoTone === 'light';

  const cardBase = slots?.background ?? theme?.gradient?.[0] ?? theme?.backgroundColor ?? '#0a1128';
  const cleanAccent = normalizeHexColor(accent) ?? '#2563eb';
  const cleanBase = normalizeHexColor(cardBase) ?? '#0a1128';

  // Tone-on-tone light ceramic glass (frosted white subtly infused with card accent/base)
  const lightTintedHex = mixHexColors('#ffffff', cleanAccent, 0.06);
  const lightGlassBg = hexToRgbaString(lightTintedHex, 0.94);
  const lightGlassBorder = hexToRgbaString(mixHexColors(cleanAccent, '#0f172a', 0.25), 0.18);

  // Tone-on-tone dark obsidian glass (deep midnight glass infused with card base/accent)
  const darkTintedHex = mixHexColors(cleanBase, cleanAccent, 0.14);
  const darkDeepBase = mixHexColors(darkTintedHex, '#030712', 0.65);
  const darkGlassBg = hexToRgbaString(darkDeepBase, 0.88);
  const darkGlassBorder = hexToRgbaString(cleanAccent, 0.32);

  const containerBg = isLogoDark
    ? lightGlassBg
    : isLogoLight
      ? darkGlassBg
      : isSurfaceLight
        ? darkGlassBg
        : lightGlassBg;

  const containerBorder = isLogoDark
    ? lightGlassBorder
    : isLogoLight
      ? darkGlassBorder
      : isSurfaceLight
        ? darkGlassBorder
        : lightGlassBorder;

  const ambientShadowColor = isRgbaOrHexLight(containerBg) ? '#000000' : cleanAccent;

  if (effectivePlacement === 'neon') {
    return {
      backgroundColor: isLogoDark ? lightGlassBg : darkGlassBg,
      borderColor: accent,
      borderWidth: 1.5,
      borderRadius: compact ? 8 : 12,
      shadowColor: accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.55,
      shadowRadius: 8,
      elevation: 4,
    };
  }

  if (effectivePlacement === 'glass') {
    return {
      backgroundColor: isLogoDark ? hexToRgbaString(lightTintedHex, 0.86) : hexToRgbaString(darkDeepBase, 0.8),
      borderColor: isLogoDark ? hexToRgbaString(cleanAccent, 0.22) : hexToRgbaString(cleanAccent, 0.35),
      borderWidth: 1,
      borderRadius: radius,
      shadowColor: ambientShadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 6,
      elevation: 3,
    };
  }

  if (effectivePlacement === 'banner') {
    return {
      backgroundColor: isLogoDark ? hexToRgbaString(lightTintedHex, 0.92) : hexToRgbaString(darkDeepBase, 0.9),
      borderColor: isLogoDark ? hexToRgbaString(cleanAccent, 0.18) : hexToRgbaString(cleanAccent, 0.3),
      borderWidth: 1,
      borderRadius: radius,
      shadowColor: ambientShadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    };
  }

  if (effectivePlacement === 'on-cover') {
    return {
      backgroundColor: containerBg,
      borderColor: containerBorder,
      borderWidth: 1,
      borderRadius: radius,
      shadowColor: ambientShadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isRgbaOrHexLight(containerBg) ? 0.14 : 0.32,
      shadowRadius: 6,
      elevation: 3,
    };
  }

  if (effectivePlacement === 'badge') {
    return {
      backgroundColor: containerBg,
      borderColor: containerBorder,
      borderWidth: 1,
      borderRadius: radius,
      shadowColor: ambientShadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    };
  }

  // Standard 'on-surface' or 'floating'
  return {
    backgroundColor: containerBg,
    borderColor: containerBorder,
    borderWidth: 1,
    borderRadius: radius,
    shadowColor: ambientShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isRgbaOrHexLight(containerBg) ? 0.12 : 0.25,
    shadowRadius: 5,
    elevation: 3,
  };
}

export function buildMultiTierSectionTheme(
  colors: string[],
  fontStyle: CardFontStyle = 'modern',
  saved?: Pick<SavedSectionThemeMeta, 'customThemeId' | 'customThemeName'>,
): CardVisualTheme {
  const count = colors.length;
  const cleanColors = colors.map((c) => normalizeHexColor(c) ?? '#2563eb');
  const tier = (count === 2 ? 2 : count >= 4 ? 4 : 3) as 2 | 3 | 4;

  let base = cleanColors[0] ?? '#eff6ff';
  let surface = cleanColors[1] ?? '#ffffff';
  let accent = cleanColors[2] ?? cleanColors[1] ?? '#0284c7';
  let gradientEnd = cleanColors[tier - 1] ?? accent;

  if (tier === 2) {
    base = cleanColors[0];
    accent = cleanColors[1];
    const isBaseLight = isColorLight(base);
    surface = isBaseLight ? mixHexColors(base, '#ffffff', 0.85) : mixHexColors(base, '#0f172a', 0.75);
    gradientEnd = accent;
  }

  const isDark = relativeLuminance(base) < 0.45;

  return {
    accentColor: accent,
    backgroundColor: base,
    customThemeId: saved?.customThemeId,
    customThemeName: saved?.customThemeName,
    fontStyle,
    gradient: [cleanColors[0], gradientEnd],
    id: 'custom',
    mutedTextColor: isDark ? '#94a3b8' : '#64748b',
    paletteColors: cleanColors,
    paletteTier: tier,
    surfaceColor: surface,
    textColor: isDark ? '#f8fafc' : '#0f172a',
  };
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

  const base = mixHexColors(start, dark ? '#020617' : '#ffffff', dark ? 0.55 : 0.82);
  const surface = dark ? mixHexColors(start, '#0f172a', 0.65) : '#ffffff';

  return {
    id: 'custom',
    gradient: [start, end],
    backgroundColor: base,
    surfaceColor: surface,
    textColor: dark ? '#f8fafc' : '#0f172a',
    mutedTextColor: dark ? mixHexColors(end, '#94a3b8', 0.35) : mixHexColors(end, '#64748b', 0.45),
    accentColor: end,
    fontStyle,
    paletteTier: 3,
    paletteColors: [base, surface, end],
    customThemeId: saved?.customThemeId,
    customThemeName: saved?.customThemeName,
  };
}

export function themeFromSavedSectionTheme(
  saved: { id: string; name: string; gradient: [string, string]; paletteTier?: 2 | 3 | 4; paletteColors?: string[] },
  fontStyle: CardFontStyle,
): CardVisualTheme {
  if (saved.paletteColors && saved.paletteColors.length >= 2) {
    return buildMultiTierSectionTheme(saved.paletteColors, fontStyle, {
      customThemeId: saved.id,
      customThemeName: saved.name,
    });
  }
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
