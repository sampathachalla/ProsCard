import { Alert, Pressable, ScrollView, View } from 'react-native';
import { ArrowDownWideNarrow } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import {
  CONTACT_SORT_OPTIONS,
  type ContactRecentFilter,
  type ContactSortId,
  type ContactSourceFilter,
} from '../Utils/contactFilters';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function FilterChip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mr-2 rounded-full border px-3.5 py-2 active:opacity-80 ${
        selected
          ? 'border-primary bg-primary/10 dark:border-dark-primary dark:bg-primary/20'
          : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'
      }`}
    >
      <Text
        variant="none"
        className={`text-sm font-semibold ${selected ? 'text-primary dark:text-dark-primary' : 'text-textPrimary dark:text-dark-textPrimary'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type ContactFilterBarProps = {
  recent: ContactRecentFilter;
  sort: ContactSortId;
  source: ContactSourceFilter;
  eventName: string;
  eventNames: string[];
  onRecentChange: (value: ContactRecentFilter) => void;
  onSortChange: (value: ContactSortId) => void;
  onSourceChange: (value: ContactSourceFilter) => void;
  onEventNameChange: (value: string) => void;
};

export function ContactFilterBar({
  recent,
  sort,
  source,
  eventName,
  eventNames,
  onRecentChange,
  onSortChange,
  onSourceChange,
  onEventNameChange,
}: ContactFilterBarProps) {
  const sortLabel = CONTACT_SORT_OPTIONS.find((option) => option.id === sort)?.label ?? 'Sort';
  const eventLabel = eventName.trim() ? eventName.trim() : 'Event';

  const openSortPicker = () => {
    Alert.alert(
      'Sort contacts',
      undefined,
      [
        ...CONTACT_SORT_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => onSortChange(option.id),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  const openEventPicker = () => {
    if (eventNames.length === 0) {
      Alert.alert('No events yet', 'Scan event badges to tag contacts with an event name.');
      return;
    }
    Alert.alert(
      'Filter by event',
      undefined,
      [
        { text: 'All events', onPress: () => onEventNameChange('') },
        ...eventNames.map((name) => ({
          text: name,
          onPress: () => onEventNameChange(name),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  return (
    <View className="pb-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${sortLabel}`}
          onPress={openSortPicker}
          className="mr-2 flex-row items-center rounded-full border border-slate-200 bg-card px-3.5 py-2 active:opacity-80 dark:border-slate-700 dark:bg-dark-card"
        >
          <ArrowDownWideNarrow color="#64748b" size={16} strokeWidth={2.2} />
          <Text variant="none" className="ml-1.5 text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
            {sortLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Event filter: ${eventLabel}`}
          onPress={openEventPicker}
          className={`mr-2 flex-row items-center rounded-full border px-3.5 py-2 active:opacity-80 ${
            eventName.trim()
              ? 'border-primary bg-primary/10 dark:border-dark-primary dark:bg-primary/20'
              : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'
          }`}
        >
          <Text
            variant="none"
            className={`text-sm font-semibold ${eventName.trim() ? 'text-primary dark:text-dark-primary' : 'text-textPrimary dark:text-dark-textPrimary'}`}
            numberOfLines={1}
          >
            {eventLabel}
          </Text>
        </Pressable>
        <FilterChip label="All" selected={source === 'all'} onPress={() => onSourceChange('all')} />
        <FilterChip label="Cards" selected={source === 'cards'} onPress={() => onSourceChange('cards')} />
        <FilterChip label="Badges" selected={source === 'badges'} onPress={() => onSourceChange('badges')} />
        <FilterChip label="Manual" selected={source === 'manual'} onPress={() => onSourceChange('manual')} />
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8 }}
      >
        <FilterChip label="All time" selected={recent === 'all'} onPress={() => onRecentChange('all')} />
        <FilterChip label="Last 7 days" selected={recent === '7d'} onPress={() => onRecentChange('7d')} />
        <FilterChip label="Last 30 days" selected={recent === '30d'} onPress={() => onRecentChange('30d')} />
      </ScrollView>
    </View>
  );
}
