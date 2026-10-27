import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileSpreadsheet, FileText } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import type { ContactExportFormat, ContactExportScope } from '../Utils/contactExport';

type ScopeOption = {
  id: ContactExportScope;
  label: string;
  count: number;
  disabled?: boolean;
  hint?: string;
};

type Props = {
  visible: boolean;
  exporting: boolean;
  scopes: ScopeOption[];
  selectedScope: ContactExportScope;
  onScopeChange: (scope: ContactExportScope) => void;
  onExport: (format: ContactExportFormat) => void;
  onClose: () => void;
};

function ScopeRow({
  option,
  selected,
  onPress,
}: {
  option: ScopeOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: option.disabled }}
      disabled={option.disabled}
      onPress={onPress}
      className={`mb-2 rounded-2xl border px-4 py-3 active:opacity-80 ${
        selected
          ? 'border-primary bg-primary/10 dark:border-dark-primary'
          : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'
      } ${option.disabled ? 'opacity-40' : ''}`}
    >
      <View className="flex-row items-center justify-between">
        <Text variant="none" className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary">
          {option.label}
        </Text>
        <Text variant="none" className="text-sm font-bold text-primary dark:text-dark-primary">
          {option.count}
        </Text>
      </View>
      {option.hint ? (
        <Text variant="none" className="mt-1 text-xs text-textMuted dark:text-dark-textMuted">
          {option.hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function ContactExportSheet({
  visible,
  exporting,
  scopes,
  selectedScope,
  onScopeChange,
  onExport,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-background dark:bg-dark-background" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="flex-row items-center border-b border-slate-200 px-5 pb-3 dark:border-slate-800">
          <Text variant="subtitle" className="flex-1">
            Export contacts
          </Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10} className="rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-800">
            <Text className="font-bold text-primary dark:text-dark-primary">Close</Text>
          </Pressable>
        </View>

        <View className="flex-1 px-5 pt-4">
          <Text variant="muted" className="mb-3">
            Export as a spreadsheet (CSV) or a printable list (PDF). Event and search filters apply to “Current view”.
          </Text>

          <Text variant="none" className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
            Which contacts
          </Text>
          {scopes.map((option) => (
            <ScopeRow
              key={option.id}
              option={option}
              selected={selectedScope === option.id}
              onPress={() => onScopeChange(option.id)}
            />
          ))}

          <Text variant="none" className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
            Format
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              disabled={exporting}
              onPress={() => onExport('csv')}
              className="min-h-[52px] flex-1 flex-row items-center justify-center rounded-2xl bg-[#2563eb] active:opacity-80 dark:bg-[#38bdf8]"
            >
              {exporting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <FileSpreadsheet color="#ffffff" size={20} />
                  <Text className="ml-2 font-bold text-white dark:text-slate-950">CSV</Text>
                </>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={exporting}
              onPress={() => onExport('pdf')}
              className="min-h-[52px] flex-1 flex-row items-center justify-center rounded-2xl border-2 border-primary active:opacity-80 dark:border-dark-primary"
            >
              {exporting ? (
                <ActivityIndicator color="#2563eb" />
              ) : (
                <>
                  <FileText color="#2563eb" size={20} />
                  <Text className="ml-2 font-bold text-primary dark:text-dark-primary">PDF list</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
