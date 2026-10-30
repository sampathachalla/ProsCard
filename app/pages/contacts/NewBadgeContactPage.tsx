import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { PageHeader } from '@/common/ui/PageHeader';
import { BadgeContactReview, emptyBadgeForm, type BadgeSaveOptions } from '@/pages/contacts/Components/BadgeContactReview';
import { createContactWithCard, initialsFor } from '@/pages/contacts/Services/contactsService';
import { rememberEventName, setCurrentEvent } from '@/pages/contacts/Services/eventNamesService';
import { clearScanResult, getScanResult } from '@/pages/scanner/Services/scanHandoff';
import type { BadgeReading } from '@/pages/scanner/types/badge.types';

function isBadgeReading(reading: unknown): reading is BadgeReading {
  return Boolean(reading && typeof reading === 'object' && 'printedEventName' in reading);
}

export default function NewBadgeContactScreen() {
  const router = useRouter();
  const { scanId, eventName: eventNameParam } = useLocalSearchParams<{ scanId?: string; eventName?: string }>();
  const [scan] = useState(() => getScanResult(scanId));
  const sessionEvent = (eventNameParam ?? scan?.meta?.eventName ?? '').trim();
  const [initial] = useState(() => {
    const reading = scan?.reading;
    const fields = isBadgeReading(reading) ? reading.contact : undefined;
    const printed = isBadgeReading(reading) ? reading.printedEventName.trim() : '';
    const eventHint = sessionEvent || printed;
    return { form: emptyBadgeForm(fields), eventName: eventHint };
  });

  const finish = () => {
    clearScanResult(scanId);
    router.dismissTo('/(tabs)/contactsPage');
  };

  const save = async (
    values: { name: string; title: string; company: string; notes: string },
    card: Parameters<typeof createContactWithCard>[1],
    { eventName, scanNext }: BadgeSaveOptions,
  ) => {
    await rememberEventName(eventName);
    // Scanning into the session's event keeps it selected for the next 8 hours.
    await setCurrentEvent(sessionEvent || eventName);
    await createContactWithCard(
      {
        name: values.name,
        title: values.title,
        company: values.company,
        phone: '',
        email: '',
        website: '',
        address: '',
        notes: values.notes,
        initials: initialsFor(values.name),
        color: Colors.light.tint,
        sourceCardId: null,
        captureKind: 'badge',
        eventName,
      },
      card,
    );
    clearScanResult(scanId);
    if (scanNext) {
      // Back to the camera on the session's event, even if this one contact was filed under another.
      router.replace({ pathname: '/scanner', params: { mode: 'badge', eventName: sessionEvent || eventName } });
      return;
    }
    router.dismissTo('/(tabs)/contactsPage');
  };

  // With no event from the scan or the badge itself, the review asks for one before saving.
  const eventName = sessionEvent || initial.eventName;

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="Review badge" subtitle="Confirm name and company from the badge" />
      <BadgeContactReview
        eventName={eventName}
        initialValues={initial.form}
        initialCard={scan?.card ?? null}
        onSave={save}
        onCancel={finish}
      />
    </View>
  );
}
