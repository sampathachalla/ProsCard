import sharp from 'sharp';

export interface DynamicTagTheme {
  id: string;
  name: string;
  tag: 'Business' | 'Personal' | 'Networking' | 'Portfolio';
  gradient: [string, string];
  surfaceColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  fontStyle: 'modern' | 'classic' | 'rounded' | 'mono';
  paletteTier: 3;
  paletteColors: string[];
  customThemeName: string;
}

export interface ExtractedLogoPalette {
  dominant: string;
  secondary: string;
  accent: string;
  hasDarkElements: boolean;
  hasLightElements: boolean;
  suggestedGradient: [string, string];
  suggestedSurface: string;
  logoBackground: string;
  isDarkRecommended: boolean;
  tagThemes: Record<'Business' | 'Personal' | 'Networking' | 'Portfolio', DynamicTagTheme>;
  paletteSource?: 'llm' | 'deterministic';
}

export function adjustHexBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  if (Number.isNaN(num)) return '#2563eb';
  let r = (num >> 16) + Math.round(255 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * percent);
  let b = (num & 0x0000ff) + Math.round(255 * percent);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const clean = hex.slice(1);
    const channels = [0, 2, 4].map((offset) => {
      const value = parseInt(clean.slice(offset, offset + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function buildDeterministicTagThemes(
  dominant: string,
  secondary: string,
  accent: string,
  hasDarkElements: boolean,
): Record<'Business' | 'Personal' | 'Networking' | 'Portfolio', DynamicTagTheme> {
  const lightSurface = hasDarkElements ? '#ffffff' : '#0f172a';
  const isLight = hasDarkElements;

  return {
    Business: {
      id: 'custom-business',
      name: 'Brand Business',
      tag: 'Business',
      gradient: [secondary, dominant],
      surfaceColor: lightSurface,
      backgroundColor: isLight ? '#f1f5f9' : '#020617',
      textColor: isLight ? '#0f172a' : '#f8fafc',
      mutedTextColor: isLight ? '#475569' : '#94a3b8',
      accentColor: dominant,
      fontStyle: 'modern',
      paletteTier: 3,
      paletteColors: [secondary, lightSurface, dominant],
      customThemeName: 'Brand Business',
    },
    Personal: {
      id: 'custom-personal',
      name: 'Brand Personal',
      tag: 'Personal',
      gradient: [adjustHexBrightness(dominant, 0.15), secondary],
      surfaceColor: hasDarkElements ? '#fffaf5' : '#111827',
      backgroundColor: isLight ? '#fefce8' : '#0a0a0a',
      textColor: isLight ? '#1c1917' : '#f5f5f4',
      mutedTextColor: isLight ? '#78716c' : '#a8a29e',
      accentColor: secondary,
      fontStyle: 'rounded',
      paletteTier: 3,
      paletteColors: [dominant, hasDarkElements ? '#fffaf5' : '#111827', secondary],
      customThemeName: 'Brand Personal',
    },
    Networking: {
      id: 'custom-networking',
      name: 'Brand Networking',
      tag: 'Networking',
      gradient: ['#030712', dominant],
      surfaceColor: lightSurface,
      backgroundColor: isLight ? '#f0f9ff' : '#020617',
      textColor: isLight ? '#0f172a' : '#f8fafc',
      mutedTextColor: isLight ? '#334155' : '#cbd5e1',
      accentColor: accent || dominant,
      fontStyle: 'modern',
      paletteTier: 3,
      paletteColors: ['#030712', lightSurface, accent || dominant],
      customThemeName: 'Brand Networking',
    },
    Portfolio: {
      id: 'custom-portfolio',
      name: 'Brand Portfolio',
      tag: 'Portfolio',
      gradient: ['#1e293b', dominant],
      surfaceColor: hasDarkElements ? '#fafafa' : '#18181b',
      backgroundColor: isLight ? '#f8fafc' : '#09090b',
      textColor: isLight ? '#18181b' : '#fafafa',
      mutedTextColor: isLight ? '#52525b' : '#a1a1aa',
      accentColor: dominant,
      fontStyle: 'classic',
      paletteTier: 3,
      paletteColors: ['#1e293b', hasDarkElements ? '#fafafa' : '#18181b', dominant],
      customThemeName: 'Brand Portfolio',
    },
  };
}

async function requestLlmTagThemes(
  dominant: string,
  secondary: string,
  accent: string,
  hasDarkElements: boolean,
): Promise<Record<'Business' | 'Personal' | 'Networking' | 'Portfolio', DynamicTagTheme> | null> {
  const apiKey = process.env.LLM_API;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const prompt = `Logo brand colors: dominant=${dominant}, secondary=${secondary}, accent=${accent}, hasDarkElements=${hasDarkElements}. Choose colors for the complete card, not only accents.`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an executive brand identity designer. All 4 themes MUST remain anchored to the logo brand colors and apply to the complete card. Generate Business, Personal, Networking, and Portfolio. Return only JSON. Every theme must include gradient (two hex colors), backgroundColor, surfaceColor, textColor, mutedTextColor, and accentColor. Text must be readable on surfaceColor. When hasDarkElements is true, use a light surface so the logo cannot disappear.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 900,
      }),
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    const fallback = buildDeterministicTagThemes(dominant, secondary, accent, hasDarkElements);
    const base = buildDeterministicTagThemes(dominant, secondary, accent, hasDarkElements);
    const isHex = (value: unknown): value is string =>
      typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

    const tags = ['Business', 'Personal', 'Networking', 'Portfolio'] as const;
    for (const tag of tags) {
      if (Array.isArray(parsed[tag]?.gradient) && isHex(parsed[tag].gradient[0]) && isHex(parsed[tag].gradient[1])) {
        base[tag].gradient = [parsed[tag].gradient[0], parsed[tag].gradient[1]];
      }
      if (isHex(parsed[tag]?.accentColor)) {
        base[tag].accentColor = parsed[tag].accentColor;
      }
      for (const key of ['backgroundColor', 'surfaceColor', 'textColor', 'mutedTextColor'] as const) {
        if (isHex(parsed[tag]?.[key])) base[tag][key] = parsed[tag][key];
      }
      if (hasDarkElements) {
        base[tag].surfaceColor = '#ffffff';
        base[tag].textColor = '#0f172a';
        base[tag].mutedTextColor = '#475569';
      }
      if (contrastRatio(base[tag].textColor, base[tag].surfaceColor) < 4.5) {
        base[tag].textColor = fallback[tag].textColor;
      }
      if (contrastRatio(base[tag].mutedTextColor, base[tag].surfaceColor) < 3) {
        base[tag].mutedTextColor = fallback[tag].mutedTextColor;
      }
      base[tag].paletteColors = [base[tag].gradient[0], base[tag].surfaceColor, base[tag].accentColor];
    }

    return base;
  } catch {
    return null;
  }
}

export async function extractPaletteFromBuffer(buffer: Buffer): Promise<ExtractedLogoPalette> {
  const { data } = await sharp(buffer)
    .resize(100, 100, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let darkPixels = 0;
  let lightPixels = 0;
  let totalOpaque = 0;
  const colorBuckets = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const a = data[i + 3]!;

    if (a < 50) continue;
    totalOpaque++;

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    if (luminance < 75) {
      darkPixels++;
    } else if (luminance > 220 && saturation < 0.15) {
      lightPixels++;
    }

    // Chromatic / branded colors
    if (saturation > 0.20 && luminance > 35 && luminance < 240) {
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      const key = `${qr},${qg},${qb}`;
      const existing = colorBuckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
      existing.count++;
      existing.r += r;
      existing.g += g;
      existing.b += b;
      colorBuckets.set(key, existing);
    }
  }

  const sortedColors = Array.from(colorBuckets.values())
    .sort((a, b) => b.count - a.count)
    .map((c) => {
      const avgR = Math.round(c.r / c.count).toString(16).padStart(2, '0');
      const avgG = Math.round(c.g / c.count).toString(16).padStart(2, '0');
      const avgB = Math.round(c.b / c.count).toString(16).padStart(2, '0');
      return `#${avgR}${avgG}${avgB}`;
    });

  // Wordmarks often contain a narrow dark text run beside a larger colored
  // symbol. A 5% threshold missed logos such as Meta and Microsoft.
  const hasDarkElements = totalOpaque > 0 && (darkPixels / totalOpaque) > 0.008;
  const hasLightElements = totalOpaque > 0 && (lightPixels / totalOpaque) > 0.05;

  const dominant = sortedColors[0] || (hasDarkElements ? '#00bffe' : '#2563eb');
  let secondary = sortedColors[1] || adjustHexBrightness(dominant, -0.28);
  const accent = sortedColors[2] || adjustHexBrightness(dominant, 0.2);

  if (dominant.toLowerCase() === secondary.toLowerCase()) {
    secondary = adjustHexBrightness(dominant, -0.28);
  }

  const llmThemes = await requestLlmTagThemes(dominant, secondary, accent, hasDarkElements);
  const tagThemes = llmThemes || buildDeterministicTagThemes(dominant, secondary, accent, hasDarkElements);

  return {
    dominant,
    secondary,
    accent,
    hasDarkElements,
    hasLightElements,
    suggestedGradient: [secondary, dominant],
    suggestedSurface: hasDarkElements ? '#ffffff' : '#0f172a',
    logoBackground: hasDarkElements ? '#ffffff' : '#0f172a',
    isDarkRecommended: !hasDarkElements,
    tagThemes,
    paletteSource: llmThemes ? 'llm' : 'deterministic',
  };
}
