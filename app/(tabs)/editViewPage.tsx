// app/(tabs)/editViewPage.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardPreview } from '../../components/editViewComponents/Components/CardPreview';
import { CardDetails } from '../../components/editViewComponents/Components/CardDetails';
import { CardForm } from '../../components/editViewComponents/Components/CardForm';
import { useEditView } from '../../components/editViewComponents/Hooks/useEditView';

export default function EditViewPage() {
  const { card, draft, isEditing, isSaving, startEditing, cancelEditing, updateField, submit } =
    useEditView();

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-textPrimary dark:text-dark-textPrimary text-2xl font-extrabold">
            {isEditing ? 'Edit Card' : 'View Card'}
          </Text>
          <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-1">
            {isEditing ? 'Update your details below' : 'This is what others see when you share'}
          </Text>
        </View>
        {!isEditing && (
          <TouchableOpacity
            className="bg-primary dark:bg-dark-primary rounded-full w-11 h-11 items-center justify-center"
            onPress={startEditing}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <CardPreview card={isEditing ? draft : card} />

        {isEditing ? (
          <CardForm draft={draft} onChange={updateField} />
        ) : (
          <CardDetails card={card} />
        )}

        {isEditing && (
          <View className="flex-row mt-2" style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center border border-textMuted dark:border-dark-textMuted"
              onPress={cancelEditing}
              disabled={isSaving}
            >
              <Text className="text-textPrimary dark:text-dark-textPrimary font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center bg-primary dark:bg-dark-primary"
              onPress={submit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">Save changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
