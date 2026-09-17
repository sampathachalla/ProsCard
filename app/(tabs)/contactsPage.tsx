// app/(tabs)/contactsPage.tsx
import { View, Text, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContactRow } from '../../components/contactsComponents/Components/ContactRow';
import { useContacts } from '../../components/contactsComponents/Hooks/useContacts';

export default function ContactsScreen() {
  const { query, setQuery, contacts, filtered } = useContacts();

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-textPrimary dark:text-dark-textPrimary text-2xl font-extrabold">
          Contact Cards
        </Text>
        <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-1">
          {contacts.length} cards collected
        </Text>

        <View className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3 mt-4">
          <Ionicons name="search" size={18} color="#7A7A7A" />
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
        renderItem={({ item }) => <ContactRow contact={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-16">
            <Ionicons name="people-outline" size={48} color="#7A7A7A" />
            <Text className="text-textMuted dark:text-dark-textMuted mt-3">
              No contacts found
            </Text>
          </View>
        }
      />
    </View>
  );
}
