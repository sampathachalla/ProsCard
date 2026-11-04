import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { EventNamePicker } from '@/pages/badgeScanner/Components/EventNamePicker';
import { useEventNameSuggestions } from '@/pages/badgeScanner/Hooks/useEventNameSuggestions';
import { hideEventName, renameStoredEventName } from '@/pages/contacts/Services/eventNamesService';
import { renameContactEvent } from '@/pages/contacts/Services/contactsService';

type Props = {
  visible: boolean;
  currentEvent: string;
  onClose: () => void;
  onChoose: (eventName: string) => void;
};

/** Ask for the event (or change it) over the camera: a previous event or a new name. */
export function BadgeEventSheet({ visible, currentEvent, onClose, onChoose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityLabel="Close" className="flex-1 bg-black/50" onPress={onClose} />
        <View
          className="max-h-[80%] rounded-t-3xl bg-background px-6 pt-5 dark:bg-dark-background"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          {/* Mounted per opening so the field starts from the event in use. */}
          {visible ? <SheetBody currentEvent={currentEvent} onChoose={onChoose} /> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SheetBody({ currentEvent, onChoose }: Pick<Props, 'currentEvent' | 'onChoose'>) {
  const { suggestions, refresh } = useEventNameSuggestions();
  const [eventName, setEventName] = useState(currentEvent);
  const [editingOriginal, setEditingOriginal] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = eventName.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    if (editingOriginal && editingOriginal.toLowerCase() !== trimmed.toLowerCase()) {
      try {
        await renameContactEvent(editingOriginal, trimmed);
        await renameStoredEventName(editingOriginal, trimmed);
      } catch (error) {
        Alert.alert('Could not rename event', error instanceof Error ? error.message : 'Please try again.');
        return;
      }
    }
    onChoose(trimmed);
  };

  const manageSuggestion = (name: string) => Alert.alert(name, undefined, [
    { text: 'Edit', onPress: () => { setEditingOriginal(name); setEventName(name); } },
    { text: 'Delete', style: 'destructive', onPress: () => { void hideEventName(name).then(refresh); } },
    { text: 'Cancel', style: 'cancel' },
  ]);

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text variant="none" className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">
        {currentEvent ? 'Change event' : 'Which event are you at?'}
      </Text>
      <Text variant="none" className="mb-4 mt-1 text-sm text-textSecondary dark:text-dark-textSecondary">
        Badges you scan are saved under this event.
      </Text>
      <EventNamePicker
        value={eventName}
        onChangeText={setEventName}
        suggestions={suggestions}
        onSubmitEditing={() => { void submit(); }}
        onLongPressSuggestion={manageSuggestion}
      />
      <View className="mt-6">
        <Button label={editingOriginal ? 'Save event name' : 'Use this event'} onPress={() => { void submit(); }} disabled={!eventName.trim()} />
      </View>
    </ScrollView>
  );
}
