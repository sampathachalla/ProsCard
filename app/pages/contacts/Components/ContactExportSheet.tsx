import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileSpreadsheet, FileText } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { ExportClosePromptContent } from './ExportClosePromptModal';
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
  selectedCount?: number;
  onScopeChange: (scope: ContactExportScope) => void;
  onExport: (format: ContactExportFormat) => void;
  onClose: () => void;
  onEditSelection?: () => void;
  onCancelExport?: () => void;
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
  selectedCount = 0,
  onScopeChange,
  onExport,
  onClose,
  onEditSelection,
  onCancelExport,
}: Props) {
  const insets = useSafeAreaInsets();
  const [showClosePrompt, setShowClosePrompt] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowClosePrompt(false);
    }
  }, [visible]);

  const handleAttemptClose = () => {
    if (selectedCount > 0) {
      setShowClosePrompt(true);
      return;
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={showClosePrompt ? () => setShowClosePrompt(false) : handleAttemptClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        {showClosePrompt ? (
          <View className="flex-1 items-center justify-center px-5">
            <Pressable
              className="absolute inset-0"
              onPress={() => setShowClosePrompt(false)}
              accessibilityLabel="Dismiss dialog"
            />
            <ExportClosePromptContent
              selectedCount={selectedCount}
              onEditSelection={() => {
                setShowClosePrompt(false);
                if (onEditSelection) {
                  onEditSelection();
                } else {
                  onClose();
                }
              }}
              onCancelExport={() => {
                setShowClosePrompt(false);
                if (onCancelExport) {
                  onCancelExport();
                } else {
                  onClose();
                }
              }}
              onKeepExporting={() => setShowClosePrompt(false)}
            />
          </View>
        ) : (
          <>
            <Pressable className="flex-1" onPress={handleAttemptClose} accessibilityLabel="Dismiss overlay" />
            <View
              className="w-full rounded-t-3xl border-t border-slate-200 bg-background dark:border-slate-800 dark:bg-dark-background"
              style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
              {/* Top handle pill */}
              <View className="items-center pt-3 pb-1">
                <View className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
              </View>

              <View className="flex-row items-center border-b border-slate-200 px-6 pb-3 pt-1 dark:border-slate-800">
                <View className="flex-1">
                  <Text variant="subtitle" className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">
                    Export contacts
                  </Text>
                  <Text variant="muted" className="mt-0.5 text-xs text-textMuted dark:text-dark-textMuted">
                    Spreadsheet (CSV) or printable list (PDF)
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close export sheet"
                  onPress={handleAttemptClose}
                  hitSlop={10}
                  className="rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-800 active:opacity-75"
                >
                  <Text className="font-bold text-primary dark:text-dark-primary">Close</Text>
                </Pressable>
              </View>

              <View className="px-6 pt-3">
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

                <Text variant="none" className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                  Format
                </Text>
                <View className="flex-row gap-3">
                  <Pressable
                    accessibilityRole="button"
                    disabled={exporting}
                    onPress={() => onExport('csv')}
                    className="min-h-[50px] flex-1 flex-row items-center justify-center rounded-2xl bg-[#2563eb] active:opacity-80 dark:bg-[#38bdf8]"
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
                    className="min-h-[50px] flex-1 flex-row items-center justify-center rounded-2xl border-2 border-primary active:opacity-80 dark:border-dark-primary"
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
          </>
        )}
      </View>
    </Modal>
  );
}
