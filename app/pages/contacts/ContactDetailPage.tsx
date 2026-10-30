// pages/contacts/ContactDetailPage.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/common/ui/PageHeader';
import { ContactReview, type ContactFormValues } from '@/pages/contacts/Components/ContactReview';
import { useContact } from '@/pages/contacts/Hooks/useContact';
import { deleteContact, initialsFor, updateContactWithCard } from '@/pages/contacts/Services/contactsService';
import type { Contact } from '@/pages/contacts/types/contact.types';
import { isBadgeContact } from '@/pages/contacts/Utils/contactFilters';
import type { ProcessedCard } from '@/pages/scanner/types/scanner.types';
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

  const save = async (values: ContactFormValues, card: ProcessedCard | null, { eventName }: { eventName: string }) => {
    if (!contact) return;
    // Returns once the edits are saved; a new card photo finishes uploading in the background.
    await updateContactWithCard(
      contact.id,
      {
        ...values,
        initials: initialsFor(values.name),
        color: contact.color,
        sourceCardId: contact.sourceCardId ?? null,
        captureKind: contact.captureKind,
        eventName,
      },
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
          eventName={contact.eventName ?? ''}
          isBadge={isBadgeContact(contact)}
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
