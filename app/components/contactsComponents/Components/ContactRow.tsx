// components/contactsComponents/Components/ContactRow.tsx
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Phone } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { MediaImage } from '@/components/uiComponents/MediaImage';
import type { Contact } from '../types/contact.types';

type ContactRowProps = {
  contact: Contact;
  onPress?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
};

export function ContactRow({ contact, onPress, onDelete }: ContactRowProps) {
  const subtitle = [contact.title, contact.company].filter(Boolean).join(' · ');

  const call = () => {
    if (!contact.phone) {
      Alert.alert('No phone number', `${contact.name} has not shared a phone number.`);
      return;
    }
    Linking.openURL(`tel:${contact.phone.replace(/[^\d+]/g, '')}`).catch(() =>
      Alert.alert('Call', `Could not start a call to ${contact.phone}.`)
    );
  };

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert('Remove contact?', `${contact.name} will be removed from your contacts.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(contact) },
    ]);
  };

  // The details area and the call button are siblings: on web both render as <button>, which cannot nest.
  return (
    <View className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3 mb-3">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${contact.name}, ${subtitle}` : contact.name}
        className="flex-1 flex-row items-center"
        accessibilityHint={onDelete ? 'Opens the contact. Long press to remove' : 'Opens the contact'}
        onPress={() => onPress?.(contact)}
        onLongPress={confirmDelete}
      >
        {contact.cardImageUrl ? (
          <MediaImage
            sourceUrl={contact.cardImageUrl}
            accessibilityLabel={`${contact.name}'s business card`}
            contentFit="cover"
            style={{ width: 64, height: 40, borderRadius: 8, marginRight: 16, backgroundColor: contact.color }}
          />
        ) : (
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: contact.color }}
          >
            <Text className="text-white font-bold">{contact.initials}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-textPrimary dark:text-dark-textPrimary font-semibold">
            {contact.name}
          </Text>
          {subtitle ? (
            <Text className="text-textMuted dark:text-dark-textMuted text-xs mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Call ${contact.name}`}
        className="w-9 h-9 ml-3 rounded-full bg-background dark:bg-dark-background items-center justify-center"
        onPress={call}
      >
        <Phone color={Colors.light.tint} size={16} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}
