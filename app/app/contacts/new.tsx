// app/contacts/new.tsx
import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import {
  AUTOFILL_NOTICE,
  ContactReview,
  EMPTY_CONTACT_FORM,
  fillEmptyFields,
  type ContactFormValues,
} from '@/components/contactsComponents/Components/ContactReview';
import { createContactWithCard, initialsFor } from '@/components/contactsComponents/Services/contactsService';
import { clearScanResult, getScanResult } from '@/components/scannerComponents/Services/scanHandoff';
import type { ProcessedCard } from '@/components/scannerComponents/types/scanner.types';

/** Review a scanned card (or enter details by hand) before saving it as a new contact. */
export default function NewContactScreen() {
  const router = useRouter();
  const { scanId } = useLocalSearchParams<{ scanId?: string }>();
  const [scan] = useState(() => getScanResult(scanId));
  const [initial] = useState(() =>
    scan?.reading ? fillEmptyFields(EMPTY_CONTACT_FORM, scan.reading.contact) : { values: EMPTY_CONTACT_FORM, filled: [] }
  );

  const save = async (values: ContactFormValues, card: ProcessedCard | null) => {
    // Returns once the contact exists; its card photo finishes uploading in the background.
    await createContactWithCard(
      { ...values, initials: initialsFor(values.name), color: Colors.light.tint, sourceCardId: null },
      card,
    );
    clearScanResult(scanId);
    router.dismissTo('/(tabs)/contactsPage');
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title={scan ? 'Review Contact' : 'New Contact'} subtitle={scan ? 'Check the details from the card' : 'Scan a card or enter details'} />
      <ContactReview
        mode="create"
        initialValues={initial.values}
        initialCard={scan?.card ?? null}
        initialAutoFilled={initial.filled}
        initialNotice={
          scan && !scan.reading
            ? { tone: 'warning', text: 'Couldn’t read the card. Enter the details yourself.' }
            : initial.filled.length ? AUTOFILL_NOTICE : null
        }
        onSave={save}
      />
    </View>
  );
}
