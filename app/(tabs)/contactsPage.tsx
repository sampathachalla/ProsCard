// app/(tabs)/contactsPage.tsx
import { View, Text, TextInput, FlatList } from 'react-native';
import { Search, Users } from 'lucide-react-native';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { ContactRow } from '../../components/contactsComponents/Components/ContactRow';
import { useContacts } from '../../components/contactsComponents/Hooks/useContacts';

export default function ContactsScreen() {
  const { query, setQuery, contacts, filtered } = useContacts();

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="Contact Cards" subtitle={`${contacts.length} cards collected`} />
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
        renderItem={({ item }) => <ContactRow contact={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-16">
            <Users color="#7A7A7A" size={48} strokeWidth={1.8} />
            <Text className="text-textMuted dark:text-dark-textMuted mt-3">
              No contacts found
            </Text>
          </View>
        }
      />
    </View>
  );
}
