import { Pressable, View } from 'react-native';
import { Eye, RotateCcw, Save as SaveIcon } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';

type Props = {
  cardName: string;
  hasChanges: boolean;
  isCreateMode: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onPreview: () => void;
  onSave: () => void;
  onUndo: () => void;
};

function PreviewButton({ cardName, onPreview }: Pick<Props, 'cardName' | 'onPreview'>) {
  return (
    <Pressable
      accessibilityLabel={`Preview ${cardName || 'card'}`}
      accessibilityRole="button"
      onPress={onPreview}
      className="flex-row items-center rounded-full border border-primary px-3 py-2 active:opacity-70 dark:border-dark-primary"
    >
      <Eye color="#3b82f6" size={17} />
      <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">Preview</Text>
    </Pressable>
  );
}

/** Right side of the editor header: undo / save / preview, depending on editing state. */
export function EditViewHeaderActions({
  cardName,
  hasChanges,
  isCreateMode,
  isEditing,
  isSaving,
  onPreview,
  onSave,
  onUndo,
}: Props) {
  if (isEditing) {
    if (!hasChanges && !isCreateMode) return <PreviewButton cardName={cardName} onPreview={onPreview} />;
    return (
      <View className="flex-row items-center gap-2">
        {hasChanges ? (
          <Pressable
            accessibilityLabel="Undo all unsaved card changes"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            className="size-10 items-center justify-center rounded-full border border-amber-500 bg-amber-500/15 active:opacity-70"
            disabled={isSaving}
            onPress={onUndo}
          >
            <RotateCcw color="#f59e0b" size={18} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel={isCreateMode ? 'Preview new card' : 'Save all card changes'}
          accessibilityRole="button"
          accessibilityState={{
            busy: isSaving,
            disabled: isSaving || (!isCreateMode && !hasChanges),
          }}
          className="flex-row items-center rounded-full bg-emerald-600 px-3 py-2 active:opacity-70 disabled:opacity-40"
          disabled={isSaving || (!isCreateMode && !hasChanges)}
          onPress={isCreateMode ? onPreview : onSave}
        >
          {isCreateMode ? <Eye color="#ffffff" size={17} /> : <SaveIcon color="#ffffff" size={17} />}
          <Text className="ml-1.5 text-sm font-bold text-white">{isSaving ? 'Saving' : isCreateMode ? 'Preview' : 'Save'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2">
      {hasChanges ? (
        <>
          <Pressable
            accessibilityLabel="Undo all unsaved card changes"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            className="size-11 items-center justify-center rounded-full border border-amber-500 bg-amber-500"
            disabled={isSaving}
            onPress={onUndo}
          >
            <RotateCcw color="#ffffff" size={20} />
          </Pressable>
          <Pressable
            accessibilityLabel="Save all card changes"
            accessibilityRole="button"
            accessibilityState={{
              disabled: isSaving,
              busy: isSaving,
            }}
            className="size-11 items-center justify-center rounded-full border border-emerald-500 bg-emerald-600"
            disabled={isSaving}
            onPress={onSave}
          >
            <SaveIcon color="#ffffff" size={20} />
          </Pressable>
        </>
      ) : (
        <PreviewButton cardName={cardName} onPreview={onPreview} />
      )}
    </View>
  );
}
