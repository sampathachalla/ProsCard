// app/contacts/[contactId].tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { ContactReview, type ContactFormValues } from '@/components/contactsComponents/Components/ContactReview';
import { useContact } from '@/components/contactsComponents/Hooks/useContact';
import { deleteContact, initialsFor, updateContactWithCard } from '@/components/contactsComponents/Services/contactsService';
import type { Contact } from '@/components/contactsComponents/types/contact.types';
import type { ProcessedCard } from '@/components/scannerComponents/types/scanner.types';
import { queryClient, queryKeys } from '@/services/api/queryClient';

const formValues = (contact: Contact): ContactFormValues => ({
  name: contact.name ?? '',
  title: contact.title ?? '',
  company: contact.company ?? '',
  phone: contact.phone ?? '',
  email: contact.email ?? '',
  website: contact.website ?? '',
  address: contact.address ?? '',
  notes: contact.notes ?? '',
});

/**
 * A saved contact: the same review screen as a fresh scan, with the stored card photo. Opens read-only;
 * the header's edit icon switches to editing (photo Retake/Upload, editable fields, Save/Delete).
 */
export default function ContactDetailScreen() {
  const router = useRouter();
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const { data: contact, isLoading, error } = useContact(contactId);
  const [editing, setEditing] = useState(false);
  // Remounting the form discards unsaved edits and reloads it from the latest saved contact.
  const [formVersion, setFormVersion] = useState(0);

  const stopEditing = () => {
    setEditing(false);
    setFormVersion((version) => version + 1);
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/contactsPage'));

  const save = async (values: ContactFormValues, card: ProcessedCard | null) => {
    if (!contact) return;
    // Returns once the edits are saved; a new card photo finishes uploading in the background.
    await updateContactWithCard(
      contact.id,
      { ...values, initials: initialsFor(values.name), color: contact.color, sourceCardId: contact.sourceCardId ?? null },
      card,
    );
    stopEditing();
  };

  const remove = async () => {
    if (!contact) return;
    await deleteContact(contact.id);
    await queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    queryClient.removeQueries({ queryKey: queryKeys.contact(contact.id) });
    close();
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        title={editing ? 'Edit Contact' : 'Contact'}
        right={
          contact ? (
            // Plain text button, like Apple Contacts: "Edit", then "Cancel" while editing.
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={editing ? 'Cancel editing' : 'Edit contact'}
              hitSlop={12}
              onPress={editing ? stopEditing : () => setEditing(true)}
              className="px-1 py-2 active:opacity-50"
            >
              <Text className="text-[17px] font-normal text-primary dark:text-dark-primary">
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </Pressable>
          ) : null
        }
      />
      {contact ? (
        <ContactReview
          key={`${contact.id}-${formVersion}`}
          contactId={contact.id}
          mode="edit"
          editing={editing}
          initialValues={formValues(contact)}
          storedImageUrl={contact.cardImageUrl || undefined}
          onSave={save}
          onDelete={remove}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-center text-textMuted dark:text-dark-textMuted">
              {error instanceof Error ? error.message : 'Contact not found.'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
