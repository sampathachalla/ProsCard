import { Pressable, ScrollView, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { CARD_THEME_PRESETS, type CardFontStyle, type CardThemeId, type CardVisualTheme } from '@/components/cardsComponents/types/card.types';
import { getCardFontFamily } from '@/components/cardsComponents/Templates/cardTheme';
import { Text } from '@/components/uiComponents/Text';

const THEME_NAMES: Record<CardThemeId, string> = { ocean: 'Ocean', midnight: 'Midnight', violet: 'Violet', sand: 'Sand' };
const FONT_NAMES: Record<CardFontStyle, string> = { modern: 'Modern', classic: 'Classic', rounded: 'Rounded', mono: 'Mono' };

export function CardThemeCustomizer({ onChange, theme }: { onChange: (theme: CardVisualTheme) => void; theme: CardVisualTheme }) {
  return <View className="mb-5 rounded-3xl border border-slate-200 p-4 dark:border-slate-700">
    <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">Section theme</Text>
    <Text variant="muted" className="mb-3 text-xs">These colors and typography apply only to this section of this card.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">{(Object.keys(CARD_THEME_PRESETS) as CardThemeId[]).map((id) => { const preset = CARD_THEME_PRESETS[id]; const selected = theme.id === id; return <Pressable key={id} onPress={() => onChange({ ...preset, gradient: [...preset.gradient], fontStyle: theme.fontStyle })} className={`mr-3 w-28 rounded-2xl border p-2 ${selected ? 'border-primary' : 'border-slate-200 dark:border-slate-700'}`}><View className="mb-2 h-12 rounded-xl" style={{ backgroundColor: preset.backgroundColor, borderColor: preset.accentColor, borderWidth: 2 }}><View className="m-2 h-4 rounded" style={{ backgroundColor: preset.accentColor }} /></View><View className="flex-row items-center justify-between"><Text className="text-xs font-bold text-textPrimary dark:text-dark-textPrimary">{THEME_NAMES[id]}</Text>{selected ? <Check color="#3b82f6" size={14} /> : null}</View></Pressable>; })}</ScrollView>
    <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">Font style</Text>
    <View className="flex-row flex-wrap gap-2">{(Object.keys(FONT_NAMES) as CardFontStyle[]).map((fontStyle) => { const selected = theme.fontStyle === fontStyle; return <Pressable key={fontStyle} onPress={() => onChange({ ...theme, fontStyle })} className={`rounded-xl border px-3 py-2 ${selected ? 'border-primary bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-700'}`}><Text style={{ fontFamily: getCardFontFamily(fontStyle) }} className="text-sm text-textPrimary dark:text-dark-textPrimary">{FONT_NAMES[fontStyle]}</Text></Pressable>; })}</View>
  </View>;
}
