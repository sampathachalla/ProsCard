import type { CardFontStyle } from '../types/card.types';
import { Platform } from 'react-native';

export function getCardFontFamily(fontStyle: CardFontStyle): string | undefined {
  if (fontStyle === 'classic') return Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' });
  if (fontStyle === 'rounded') return Platform.select({ ios: 'Arial Rounded MT Bold', android: 'sans-serif-medium', web: 'Arial Rounded MT Bold, Arial, sans-serif' });
  if (fontStyle === 'mono') return Platform.select({ ios: 'Menlo', android: 'monospace', web: 'Menlo, monospace' });
  return Platform.select({ ios: 'System', android: 'sans-serif', web: 'system-ui, sans-serif' });
}

export function getCardLetterSpacing(fontStyle: CardFontStyle): number {
  if (fontStyle === 'rounded') return 0.6;
  if (fontStyle === 'mono') return 0.2;
  return 0;
}

export type MultiTierPreset = {
  id: string;
  name: string;
  tier: 2 | 3 | 4;
  colors: string[];
};

export const MULTI_TIER_PRESETS: MultiTierPreset[] = [
  // 2-Color Tier
  { id: 'slate-cyan', name: 'Slate & Cyan', tier: 2, colors: ['#0f172a', '#38bdf8'] },
  { id: 'paper-ink', name: 'Paper & Onyx', tier: 2, colors: ['#fafaf9', '#1c1917'] },
  { id: 'emerald-duo', name: 'Emerald Duo', tier: 2, colors: ['#064e3b', '#34d399'] },
  { id: 'solar-amber', name: 'Solar Amber', tier: 2, colors: ['#451a03', '#f59e0b'] },
  { id: 'royal-white', name: 'Royal & White', tier: 2, colors: ['#1e1b4b', '#818cf8'] },

  // 3-Color Tier
  { id: 'ocean-breeze', name: 'Ocean Breeze', tier: 3, colors: ['#eff6ff', '#ffffff', '#0284c7'] },
  { id: 'midnight-slate', name: 'Midnight Slate', tier: 3, colors: ['#020617', '#0f172a', '#38bdf8'] },
  { id: 'violet-pulse', name: 'Violet Pulse', tier: 3, colors: ['#f5f3ff', '#ffffff', '#7c3aed'] },
  { id: 'sand-warm', name: 'Warm Sand', tier: 3, colors: ['#fffbeb', '#fff7ed', '#ea580c'] },
  { id: 'crimson-noir', name: 'Crimson Noir', tier: 3, colors: ['#18181b', '#27272a', '#f43f5e'] },

  // 4-Color Tier
  { id: 'aurora-glass', name: 'Aurora Glass', tier: 4, colors: ['#022c22', '#064e3b', '#10b981', '#06b6d4'] },
  { id: 'sunset-prism', name: 'Sunset Prism', tier: 4, colors: ['#431407', '#7c2d12', '#ea580c', '#ec4899'] },
  { id: 'cyber-neon', name: 'Cyber Neon', tier: 4, colors: ['#09090b', '#18181b', '#8b5cf6', '#06b6d4'] },
  { id: 'pearl-frost', name: 'Pearl Frost', tier: 4, colors: ['#f8fafc', '#ffffff', '#2563eb', '#93c5fd'] },
  { id: 'amethyst-glow', name: 'Amethyst Glow', tier: 4, colors: ['#2e1065', '#3b0764', '#a855f7', '#f472b6'] },
];
