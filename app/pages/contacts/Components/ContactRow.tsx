// pages/contacts/Components/ContactRow.tsx
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Check, Phone } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { MediaImage } from '@/common/ui/MediaImage';
import type { Contact } from '../types/contact.types';
import { isBadgeContact } from '../Utils/contactFilters';

type ContactRowProps = {
  contact: Contact;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (contact: Contact) => void;
  onPress?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
};

export function ContactRow({
  contact,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  onPress,
  onDelete,
}: ContactRowProps) {
  const subtitleParts = [contact.title, contact.company].filter(Boolean);
  if (isBadgeContact(contact) && contact.eventName?.trim()) {
    subtitleParts.push(contact.eventName.trim());
  }
  const subtitle = subtitleParts.join(' · ');

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
  const open = () => {
    if (selectionMode) {
      onToggleSelect?.(contact);
      return;
    }
    onPress?.(contact);
  };

  return (
    <View
      className={`flex-row items-center rounded-2xl px-4 py-3 mb-3 ${
        selected ? 'border-2 border-primary bg-primary/5 dark:border-dark-primary' : 'bg-card dark:bg-dark-card'
      }`}
    >
      {selectionMode ? (
        <TouchableOpacity
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected }}
          accessibilityLabel={`Select ${contact.name}`}
          onPress={() => onToggleSelect?.(contact)}
          className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600"
        >
          {selected ? <Check color="#2563eb" size={18} strokeWidth={3} /> : null}
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${contact.name}, ${subtitle}` : contact.name}
        className="flex-1 flex-row items-center"
        accessibilityHint={
          selectionMode
            ? 'Toggles selection'
            : onDelete
              ? 'Opens the contact. Long press to remove'
              : 'Opens the contact'
        }
        onPress={open}
        onLongPress={selectionMode ? undefined : confirmDelete}
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
      {!selectionMode ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Call ${contact.name}`}
          className="w-9 h-9 ml-3 rounded-full bg-background dark:bg-dark-background items-center justify-center"
          onPress={call}
        >
          <Phone color={Colors.light.tint} size={16} strokeWidth={2.2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
