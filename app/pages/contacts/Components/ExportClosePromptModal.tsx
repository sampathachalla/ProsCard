import { Modal, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, ChevronRight, Share2, Trash2, X } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export type ExportClosePromptContentProps = {
  selectedCount: number;
  onEditSelection: () => void;
  onCancelExport: () => void;
  onKeepExporting: () => void;
};

export function ExportClosePromptContent({
  selectedCount,
  onEditSelection,
  onCancelExport,
  onKeepExporting,
}: ExportClosePromptContentProps) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const chevronColor = isDark ? '#64748b' : '#94a3b8';

  const handleEdit = () => {
    Haptics.selectionAsync().catch(() => {});
    onEditSelection();
  };

  const handleCancelExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onCancelExport();
  };

  const handleKeepExporting = () => {
    Haptics.selectionAsync().catch(() => {});
    onKeepExporting();
  };

  return (
    <View className="w-full max-w-[380px] rounded-3xl border border-slate-200/80 bg-background p-5 shadow-2xl dark:border-slate-800 dark:bg-dark-card">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky-500/15">
            <Share2 size={20} color={tint} strokeWidth={2.2} />
          </View>
          <View>
            <Text
              accessibilityRole="header"
              className="text-[17px] font-bold text-textPrimary dark:text-dark-textPrimary"
            >
              Export contacts
            </Text>
            <Text className="text-xs font-medium text-textMuted dark:text-dark-textMuted">
              {selectedCount > 0
                ? `${selectedCount} contact${selectedCount === 1 ? '' : 's'} selected`
                : 'Selection active'}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
          hitSlop={8}
          onPress={handleKeepExporting}
          className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:opacity-75 dark:bg-slate-800"
        >
          <X size={16} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* Modern Action Cards */}
      <View className="mt-4 gap-2.5">
        {/* Action 1: Edit selection */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit selection"
          onPress={handleEdit}
          className="flex-row items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 active:opacity-75 dark:border-slate-700/60 dark:bg-slate-800/50"
        >
          <View className="flex-1 flex-row items-center gap-3 pr-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky-500/15">
              <Check size={18} color={tint} strokeWidth={2.6} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-textPrimary dark:text-dark-textPrimary">
                Edit selection
              </Text>
              <Text className="mt-0.5 text-xs text-textMuted dark:text-dark-textMuted">
                Add or remove contacts
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={chevronColor} strokeWidth={2.2} />
        </Pressable>

        {/* Action 2: Cancel export */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel export"
          onPress={handleCancelExport}
          className="flex-row items-center justify-between rounded-2xl border border-rose-200/70 bg-rose-50/60 p-3.5 active:opacity-75 dark:border-rose-900/40 dark:bg-rose-950/25"
        >
          <View className="flex-1 flex-row items-center gap-3 pr-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 dark:bg-rose-500/20">
              <Trash2 size={18} color={isDark ? '#f87171' : '#e11d48'} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-rose-600 dark:text-rose-400">
                Cancel export
              </Text>
              <Text className="mt-0.5 text-xs text-rose-500/80 dark:text-rose-400/75">
                Clear selection and return to contacts
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={isDark ? '#f87171' : '#f43f5e'} strokeWidth={2.2} />
        </Pressable>

        {/* Action 3: Keep exporting */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Keep exporting"
          onPress={handleKeepExporting}
          className="mt-0.5 min-h-[38px] items-center justify-center rounded-xl active:opacity-70"
        >
          <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted">
            Keep exporting
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export type ExportClosePromptModalProps = {
  visible: boolean;
  selectedCount: number;
  onEditSelection: () => void;
  onCancelExport: () => void;
  onKeepExporting: () => void;
};

export function ExportClosePromptModal({
  visible,
  selectedCount,
  onEditSelection,
  onCancelExport,
  onKeepExporting,
}: ExportClosePromptModalProps) {
  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onKeepExporting}
    >
      <View className="flex-1 items-center justify-center bg-slate-950/70 px-5">
        <Pressable
          className="absolute inset-0"
          onPress={onKeepExporting}
          accessibilityLabel="Dismiss dialog"
        />
        <ExportClosePromptContent
          selectedCount={selectedCount}
          onEditSelection={onEditSelection}
          onCancelExport={onCancelExport}
          onKeepExporting={onKeepExporting}
        />
      </View>
    </Modal>
  );
}
