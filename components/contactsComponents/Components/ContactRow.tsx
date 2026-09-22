// components/contactsComponents/Components/ContactRow.tsx
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Phone } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import type { Contact } from '../types/contact.types';

export function ContactRow({ contact }: { contact: Contact }) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3 mb-3"
      onPress={() => Alert.alert(contact.name, `${contact.title} at ${contact.company}\n${contact.phone}`)}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: contact.color }}
      >
        <Text className="text-white font-bold">{contact.initials}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-textPrimary dark:text-dark-textPrimary font-semibold">
          {contact.name}
        </Text>
        <Text className="text-textMuted dark:text-dark-textMuted text-xs mt-0.5">
          {contact.title} · {contact.company}
        </Text>
      </View>
      <TouchableOpacity
        className="w-9 h-9 rounded-full bg-background dark:bg-dark-background items-center justify-center"
        onPress={() => Alert.alert('Call', `Calling ${contact.phone}...`)}
      >
        <Phone color={Colors.light.tint} size={16} strokeWidth={2.2} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
