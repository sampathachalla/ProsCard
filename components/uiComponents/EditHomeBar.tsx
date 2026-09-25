import { ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LayoutTemplate, ListPlus, Save, type LucideIcon } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from './Text';

export type EditHomeTab = 'layout' | 'content';

const ITEMS: { id: EditHomeTab; label: string; icon: LucideIcon }[] = [
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'content', label: 'Content', icon: ListPlus },
];

export function EditHomeBar({ activeTab, isSaving = false, onChange, onSave, saveDisabled = false }: { activeTab: EditHomeTab; isSaving?: boolean; onChange: (tab: EditHomeTab) => void; onSave: () => void; saveDisabled?: boolean }) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const select = (tab: EditHomeTab) => {
    if (tab !== activeTab) Haptics.selectionAsync().catch(() => {});
    onChange(tab);
  };

  const save = () => {
    if (isSaving || saveDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSave();
  };

  return (
    <Animated.View
      key="expanded-edit-bar"
      accessibilityRole="tablist"
      entering={FadeIn.duration(520)}
      exiting={FadeOut.duration(420)}
      className="flex-row bg-transparent"
    >
      {ITEMS.map(({ id, icon: Icon, label }) => {
        const selected = activeTab === id;
        return (
          <Pressable
            accessibilityLabel={`${label} customization`}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="min-w-0 flex-1 items-center justify-center px-1 active:opacity-70"
            key={id}
            onPress={() => select(id)}
            style={{ minHeight: compact ? 46 : 50, paddingVertical: 4 }}
          >
            {selected ? <Animated.View entering={FadeIn.duration(260)} className="absolute top-0 h-0.5 w-8 rounded-full bg-primary dark:bg-dark-primary" /> : null}
            <Icon color={selected ? '#3b82f6' : '#64748b'} size={compact ? 17 : 18} strokeWidth={selected ? 2.5 : 2} />
            <Text numberOfLines={1} className={`mt-0.5 font-semibold ${compact ? 'text-[10px]' : 'text-[11px]'} ${selected ? 'text-primary dark:text-dark-primary' : 'text-textMuted dark:text-dark-textMuted'}`}>{label}</Text>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityLabel="Save section changes"
        accessibilityRole="button"
        accessibilityState={{ busy: isSaving, disabled: isSaving || saveDisabled }}
        className="min-w-0 flex-1 items-center justify-center px-1 active:opacity-70"
        disabled={isSaving || saveDisabled}
        onPress={save}
        style={{ minHeight: compact ? 46 : 50, paddingVertical: 4 }}
      >
        {!saveDisabled ? <Animated.View entering={FadeIn.duration(260)} className="absolute top-0 h-0.5 w-8 rounded-full bg-emerald-500" /> : null}
        {isSaving ? <ActivityIndicator color="#10b981" size="small" /> : <Save color={saveDisabled ? '#94a3b8' : '#10b981'} size={compact ? 17 : 18} />}
        <Text numberOfLines={1} className={`mt-0.5 font-semibold ${saveDisabled ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-500'} ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{isSaving ? 'Saving' : 'Save'}</Text>
      </Pressable>
    </Animated.View>
  );
}
