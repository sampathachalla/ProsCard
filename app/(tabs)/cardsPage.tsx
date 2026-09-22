import { FlatList, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useCards } from '@/components/cardsComponents/Hooks/useCards';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { Text } from '@/components/uiComponents/Text';

export default function CardsPageScreen() {
  const { cards } = useCards();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        title="My Cards"
        subtitle={`${cards.length} digital ${cards.length === 1 ? 'card' : 'cards'}`}
      />

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-16 px-6">
            <Text variant="heading" className="text-center">
              No cards yet
            </Text>
            <Text variant="muted" className="mt-2 text-center">
              Create a card from the home screen or editor.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            className="mb-3 flex-row items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-card active:opacity-85 dark:border-slate-700/60 dark:bg-dark-card"
            onPress={() => router.push('/(tabs)/editViewPage')}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 6, alignSelf: 'stretch' }}
            />
            <View className="flex-1 px-4 py-4">
              <Text className="text-base font-bold text-textPrimary dark:text-dark-textPrimary">
                {item.name}
              </Text>
              <Text variant="muted" className="mt-0.5">
                {item.title}
                {item.company ? ` · ${item.company}` : ''}
              </Text>
            </View>
            <View className="mr-3">
              <ChevronRight color="#94a3b8" size={20} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
