// app/(tabs)/contactsPage.tsx
import { View, Text, TextInput, FlatList, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Users } from 'lucide-react-native';
import { IconButton } from '@/components/uiComponents/IconButton';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { useCardCapture } from '../../components/scannerComponents/Hooks/useCardCapture';
import { ContactRow } from '../../components/contactsComponents/Components/ContactRow';
import { useContacts } from '../../components/contactsComponents/Hooks/useContacts';
import { deleteContact } from '../../components/contactsComponents/Services/contactsService';
import type { Contact } from '../../components/contactsComponents/types/contact.types';

export default function ContactsScreen() {
  const { query, setQuery, contacts, filtered, loading, refreshing, error, refresh } = useContacts();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { busy: capturing, startContactFromCard } = useCardCapture();
  const addContact = () => {
    Alert.alert('Add contact', 'Create a contact from a business card or enter details yourself.', [
      { text: 'Scan business card', onPress: () => { void startContactFromCard('scan'); } },
      { text: 'Upload card photo', onPress: () => { void startContactFromCard('library'); } },
      { text: 'Enter manually', onPress: () => router.push('/contacts/new') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  const removeContact = (contact: Contact) => {
    deleteContact(contact.id)
      .then(() => refresh())
      .catch((reason) => Alert.alert('Remove failed', reason instanceof Error ? reason.message : 'Try again.'));
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        title="Contact Cards"
        subtitle={`${contacts.length} cards collected`}
        right={<IconButton icon={Plus} accessibilityLabel="Add contact" variant="primary" disabled={capturing} onPress={addContact} />}
      />
      <View className="px-6 pb-4">
        <View className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3 mt-4">
          <Search color="#7A7A7A" size={18} strokeWidth={2.2} />
          <TextInput
            placeholder="Search contacts"
            placeholderTextColor="#7A7A7A"
            value={query}
            onChangeText={setQuery}
            className="flex-1 ml-3 text-textPrimary dark:text-dark-textPrimary"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactRow contact={item} onDelete={removeContact} />}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-16">
            <Users color="#7A7A7A" size={48} strokeWidth={1.8} />
            <Text className="text-textMuted dark:text-dark-textMuted mt-3">
              {loading ? 'Loading contacts…' : error ? 'Could not load contacts. Pull to retry.' : query.trim() ? 'No contacts found' : 'No contacts yet. Tap + to scan a business card.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
