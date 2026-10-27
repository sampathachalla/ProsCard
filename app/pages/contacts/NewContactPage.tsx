// pages/contacts/NewContactPage.tsx
import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { PageHeader } from '@/common/ui/PageHeader';
import {
  AUTOFILL_NOTICE,
  ContactReview,
  EMPTY_CONTACT_FORM,
  fillEmptyFields,
  type ContactFormValues,
} from '@/pages/contacts/Components/ContactReview';
import { createContactWithCard, initialsFor, updateContactWithCard } from '@/pages/contacts/Services/contactsService';
import { useContacts } from '@/pages/contacts/Hooks/useContacts';
import { clearScanResult, getScanResult } from '@/pages/scanner/Services/scanHandoff';
import type { ProcessedCard } from '@/pages/scanner/types/scanner.types';

/** Review a scanned card (or enter details by hand) before saving it as a new contact. */
export default function NewContactScreen() {
  const router = useRouter();
  const { scanId } = useLocalSearchParams<{ scanId?: string }>();
  const { contacts } = useContacts();
  const [scan] = useState(() => getScanResult(scanId));
  const [initial] = useState(() => {
    const reading = scan?.reading;
    const cardContact =
      reading && 'phone' in reading.contact ? reading.contact : null;
    return cardContact
      ? fillEmptyFields(EMPTY_CONTACT_FORM, cardContact)
      : { values: EMPTY_CONTACT_FORM, filled: [] };
  });

  const save = async (values: ContactFormValues, card: ProcessedCard | null) => {
    const captureKind = scan ? 'business_card' : 'manual';
    await createContactWithCard(
      { ...values, initials: initialsFor(values.name), color: Colors.light.tint, sourceCardId: null, captureKind },
      card,
    );
    clearScanResult(scanId);
    router.dismissTo('/(tabs)/contactsPage');
  };
  const finish = () => {
    clearScanResult(scanId);
    router.dismissTo('/(tabs)/contactsPage');
  };
  const replaceDuplicate = async (contactId: string, values: ContactFormValues, card: ProcessedCard | null) => {
    await updateContactWithCard(
      contactId,
      { ...values, initials: initialsFor(values.name), color: Colors.light.tint, sourceCardId: null, captureKind: 'manual' },
      card,
    );
    finish();
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title={scan ? 'Review Contact' : 'New Contact'} subtitle={scan ? 'Check the details from the card' : 'Scan a card or enter details'} />
      <ContactReview
        mode="create"
        initialValues={initial.values}
        initialCard={scan?.card ?? null}
        existingContacts={contacts}
        initialAutoFilled={initial.filled}
        initialNotice={
          scan && !scan.reading
            ? { tone: 'warning', text: 'Couldn’t read the card. Enter the details yourself.' }
            : initial.filled.length ? AUTOFILL_NOTICE : null
        }
        onSave={save}
        onDiscardDuplicate={finish}
        onReplaceDuplicate={replaceDuplicate}
      />
    </View>
  );
}
