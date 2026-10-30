import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { EventNamePicker } from '@/pages/badgeScanner/Components/EventNamePicker';
import { useEventNameSuggestions } from '@/pages/badgeScanner/Hooks/useEventNameSuggestions';

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
  const suggestions = useEventNameSuggestions();
  const [eventName, setEventName] = useState(currentEvent);

  const submit = () => {
    const trimmed = eventName.trim();
    if (trimmed) onChoose(trimmed);
  };

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
        onSubmitEditing={submit}
      />
      <View className="mt-6">
        <Button label="Use this event" onPress={submit} disabled={!eventName.trim()} />
      </View>
    </ScrollView>
  );
}
