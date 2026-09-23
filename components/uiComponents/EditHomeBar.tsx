import { ActivityIndicator, Pressable, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LayoutTemplate, ListPlus, Palette, Save, type LucideIcon } from 'lucide-react-native';
import { Text } from './Text';

export type EditHomeTab = 'layout' | 'theme' | 'content';

const ITEMS: { id: EditHomeTab; label: string; icon: LucideIcon }[] = [
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'content', label: 'Content', icon: ListPlus },
];

export function EditHomeBar({ activeTab, isSaving = false, onChange, onSave, saveDisabled = false }: { activeTab: EditHomeTab; isSaving?: boolean; onChange: (tab: EditHomeTab) => void; onSave: () => void; saveDisabled?: boolean }) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const select = (tab: EditHomeTab) => {
    if (tab === activeTab) return;
    Haptics.selectionAsync().catch(() => {});
    onChange(tab);
  };

  const save = () => {
    if (isSaving || saveDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSave();
  };

  return (
    <View accessibilityRole="tablist" className="flex-row gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
      {ITEMS.map(({ id, icon: Icon, label }) => {
        const selected = activeTab === id;
        return (
          <Pressable
            accessibilityLabel={`${label} customization`}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={`min-w-0 flex-1 items-center justify-center rounded-xl px-1 active:opacity-70 ${selected ? 'bg-primary dark:bg-dark-primary' : ''}`}
            key={id}
            onPress={() => select(id)}
            style={{ minHeight: compact ? 54 : 62, paddingVertical: compact ? 6 : 8 }}
          >
            <Icon color={selected ? '#ffffff' : '#64748b'} size={compact ? 17 : 19} />
            <Text numberOfLines={1} className={`mt-1 font-bold ${compact ? 'text-[10px]' : 'text-xs'} ${selected ? 'text-white' : 'text-textMuted dark:text-dark-textMuted'}`}>{label}</Text>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityLabel="Save section changes"
        accessibilityRole="button"
        accessibilityState={{ busy: isSaving, disabled: isSaving || saveDisabled }}
        className={`min-w-0 flex-1 items-center justify-center rounded-xl px-1 active:opacity-70 ${saveDisabled ? 'bg-slate-300 dark:bg-slate-700' : 'bg-emerald-600'}`}
        disabled={isSaving || saveDisabled}
        onPress={save}
        style={{ minHeight: compact ? 54 : 62, paddingVertical: compact ? 6 : 8 }}
      >
        {isSaving ? <ActivityIndicator color="#ffffff" size="small" /> : <Save color={saveDisabled ? '#94a3b8' : '#ffffff'} size={compact ? 17 : 19} />}
        <Text numberOfLines={1} className={`mt-1 font-bold ${saveDisabled ? 'text-slate-500 dark:text-slate-400' : 'text-white'} ${compact ? 'text-[10px]' : 'text-xs'}`}>{isSaving ? 'Saving' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}
