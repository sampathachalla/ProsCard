// app/(tabs)/contactsPage.tsx
import { useRef } from 'react';
import type BottomSheet from '@gorhom/bottom-sheet';
import { View, Text, TextInput, FlatList, RefreshControl, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Users, X } from 'lucide-react-native';
import { IconButton } from '@/components/uiComponents/IconButton';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { AddContactBottomSheet } from '../../components/contactsComponents/Components/AddContactBottomSheet';
import { ContactRow } from '../../components/contactsComponents/Components/ContactRow';
import { useContacts } from '../../components/contactsComponents/Hooks/useContacts';
import { deleteContact } from '../../components/contactsComponents/Services/contactsService';
import type { Contact } from '../../components/contactsComponents/types/contact.types';

export default function ContactsScreen() {
  const { query, setQuery, contacts, filtered, loading, refreshing, error, refresh } = useContacts();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addSheetRef = useRef<BottomSheet>(null);
  const addContact = () => addSheetRef.current?.snapToIndex(0);
  const removeContact = (contact: Contact) => {
    deleteContact(contact.id)
      .then(() => refresh())
      .catch((reason) => Alert.alert('Remove failed', reason instanceof Error ? reason.message : 'Try again.'));
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background dark:bg-dark-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader
        title="Contact Cards"
        subtitle={`${contacts.length} cards collected`}
        right={<IconButton icon={Plus} accessibilityLabel="Add contact" variant="primary" onPress={addContact} />}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactRow contact={item} onPress={(contact) => router.push(`/contacts/${contact.id}`)} onDelete={removeContact} />
        )}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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

      {/* Search sits at the bottom, within thumb reach, and rises with the keyboard. */}
      <View className="px-6 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <View className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3">
          <Search color="#7A7A7A" size={18} strokeWidth={2.2} />
          <TextInput
            placeholder="Search contacts"
            placeholderTextColor="#7A7A7A"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            className="flex-1 ml-3 text-textPrimary dark:text-dark-textPrimary"
          />
          {query ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery('')}>
              <X color="#7A7A7A" size={18} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {/* Scans and uploads go through the scanner so they show its processing animation before the review. */}
      <AddContactBottomSheet
        ref={addSheetRef}
        onScan={() => router.push('/scanner')}
        onUpload={() => router.push({ pathname: '/scanner', params: { source: 'library' } })}
        onManual={() => router.push('/contacts/new')}
      />
    </KeyboardAvoidingView>
  );
}
