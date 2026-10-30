// pages/contacts/ContactsPage.tsx
import { useMemo, useRef, useState } from 'react';
import type BottomSheet from '@gorhom/bottom-sheet';
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Share2, Users, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { IconButton } from '@/common/ui/IconButton';
import { PageHeader } from '@/common/ui/PageHeader';
import { AddContactBottomSheet } from './Components/AddContactBottomSheet';
import { ContactExportSheet } from './Components/ContactExportSheet';
import { ContactFilterBar } from './Components/ContactFilterBar';
import { ContactRow } from './Components/ContactRow';
import { ExportClosePromptModal } from './Components/ExportClosePromptModal';
import { useContacts } from './Hooks/useContacts';
import { deleteContact } from './Services/contactsService';
import { exportContactList } from './Services/contactExportService';
import type { Contact } from './types/contact.types';
import { useCardCapture } from '@/pages/scanner/Hooks/useCardCapture';
import {
  buildFilterSummary,
  resolveExportContacts,
  type ContactExportFormat,
  type ContactExportScope,
} from './Utils/contactExport';

export default function ContactsScreen() {
  const {
    query,
    setQuery,
    sort,
    setSort,
    source,
    setSource,
    recent,
    setRecent,
    eventName,
    setEventName,
    eventNames,
    filtersActive,
    contacts,
    filtered,
    loading,
    refreshing,
    error,
    refresh,
  } = useContacts();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addSheetRef = useRef<BottomSheet>(null);
  const { captureCard: chooseCardPhoto } = useCardCapture();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const [exportScope, setExportScope] = useState<ContactExportScope>('filtered');
  const [exporting, setExporting] = useState(false);

  const filterSummary = useMemo(
    () => buildFilterSummary({ query, eventName, source, recent, filtersActive }),
    [eventName, filtersActive, query, recent, source],
  );

  const exportScopes = useMemo(
    () => [
      {
        id: 'filtered' as const,
        label: 'Current view',
        count: filtered.length,
        hint: filtersActive
          ? filterSummary ?? 'Matches search and filters'
          : 'Same as all contacts when no filters are on',
      },
      {
        id: 'all' as const,
        label: 'All contacts',
        count: contacts.length,
      },
      {
        id: 'selected' as const,
        label: 'Selected only',
        count: selectedIds.size,
        disabled: false,
        hint: selectedIds.size === 0 ? 'Tap to choose contacts from the list' : undefined,
      },
    ],
    [contacts.length, filterSummary, filtered.length, filtersActive, selectedIds.size],
  );

  const addContact = () => addSheetRef.current?.snapToIndex(0);
  const uploadCard = async () => {
    const card = await chooseCardPhoto('library');
    if (!card) return;
    router.push({
      pathname: '/scanner',
      params: {
        source: 'upload',
        imageUri: card.uri,
        mimeType: card.mimeType ?? '',
        fileName: card.fileName ?? '',
      },
    });
  };
  const removeContact = (contact: Contact) => {
    deleteContact(contact.id)
      .then(() => refresh())
      .catch((reason) => Alert.alert('Remove failed', reason instanceof Error ? reason.message : 'Try again.'));
  };

  const toggleSelect = (contact: Contact) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(contact.id)) next.delete(contact.id);
      else next.add(contact.id);
      return next;
    });
  };

  const enterSelectionMode = () => {
    Haptics.selectionAsync().catch(() => {});
    setSelectionMode(true);
    setExportScope('selected');
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    if (exportScope === 'selected') setExportScope('filtered');
  };

  const openExport = () => {
    if (selectionMode && selectedIds.size > 0) setExportScope('selected');
    else if (filtersActive && filtered.length > 0) setExportScope('filtered');
    else setExportScope('all');
    setExportOpen(true);
  };

  const handleCloseExport = () => {
    setExportOpen(false);
  };

  const handlePromptEditSelection = () => {
    setClosePromptOpen(false);
    setExportOpen(false);
  };

  const handlePromptCancelExport = () => {
    setClosePromptOpen(false);
    setExportOpen(false);
    exitSelectionMode();
  };

  const handlePromptKeepExporting = () => {
    setClosePromptOpen(false);
  };

  const handleScopeChange = (scope: ContactExportScope) => {
    if (scope === 'selected' && selectedIds.size === 0) {
      setExportOpen(false);
      enterSelectionMode();
      return;
    }
    setExportScope(scope);
  };

  const runExport = async (format: ContactExportFormat) => {
    if (exportScope === 'selected' && selectedIds.size === 0) {
      setExportOpen(false);
      enterSelectionMode();
      return;
    }
    const list = resolveExportContacts(exportScope, { all: contacts, filtered, selectedIds });
    setExporting(true);
    try {
      await exportContactList({
        contacts: list,
        format,
        scope: exportScope,
        context: {
          eventName: eventName.trim() || undefined,
          filterSummary: exportScope === 'filtered' ? filterSummary : undefined,
        },
      });
      setExportOpen(false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background dark:bg-dark-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader
        title="Contact Cards"
        subtitle={
          selectionMode
            ? `${selectedIds.size} selected`
            : filtersActive
              ? `${filtered.length} of ${contacts.length} contacts`
              : `${contacts.length} cards collected`
        }
        showBackButton={false}
        right={
          <View className="flex-row items-center gap-1">
            {selectionMode ? (
              <>
                <Pressable
                  onPress={() => {
                    if (selectedIds.size === filtered.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(filtered.map((c) => c.id)));
                    }
                  }}
                  hitSlop={8}
                  className="mr-2 px-1"
                >
                  <Text className="text-sm font-semibold text-primary dark:text-dark-primary">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? 'Deselect all' : 'Select all'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (selectedIds.size > 0) {
                      setClosePromptOpen(true);
                    } else {
                      exitSelectionMode();
                    }
                  }}
                  hitSlop={8}
                  className="mr-1 px-1"
                >
                  <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cancel</Text>
                </Pressable>
              </>
            ) : (
              <IconButton icon={Share2} accessibilityLabel="Export contacts" variant="ghost" onPress={openExport} />
            )}
            <IconButton icon={Plus} accessibilityLabel="Add contact" variant="primary" onPress={addContact} />
          </View>
        }
      />
      <ContactFilterBar
        recent={recent}
        sort={sort}
        source={source}
        eventName={eventName}
        eventNames={eventNames}
        onRecentChange={setRecent}
        onSortChange={setSort}
        onSourceChange={setSource}
        onEventNameChange={setEventName}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            selectionMode={selectionMode}
            selected={selectedIds.has(item.id)}
            onToggleSelect={toggleSelect}
            onPress={(contact) => router.push(`/contacts/${contact.id}`)}
            onDelete={removeContact}
          />
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
              {loading
                ? 'Loading contacts…'
                : error
                  ? 'Could not load contacts. Pull to retry.'
                  : filtersActive
                    ? 'No contacts match these filters'
                    : 'No contacts yet. Tap + to scan a business card.'}
            </Text>
          </View>
        }
      />

      {selectionMode ? (
        <View className="border-t border-slate-200 bg-background px-6 py-3 dark:border-slate-800 dark:bg-dark-background">
          <Pressable
            onPress={openExport}
            disabled={selectedIds.size === 0}
            className={`min-h-[48px] items-center justify-center rounded-2xl bg-primary active:opacity-80 dark:bg-dark-primary ${
              selectedIds.size === 0 ? 'opacity-40' : ''
            }`}
          >
            <Text className="font-bold text-white dark:text-slate-950">
              {selectedIds.size > 0 ? `Export selected (${selectedIds.size})` : 'Select contacts to export'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View className="px-6 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <View className="min-h-[54px] flex-row items-center rounded-lg border border-transparent bg-slate-100 px-4 py-2 dark:bg-dark-card">
          <Search color="#64748b" size={18} strokeWidth={2.2} />
          <TextInput
            placeholder="Search name, company, event…"
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            className="ml-3 flex-1 text-[16px] font-normal text-textPrimary dark:text-dark-textPrimary"
          />
          {query ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery('')}>
              <X color="#64748b" size={18} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <AddContactBottomSheet
        ref={addSheetRef}
        onScan={() => router.push('/scanner')}
        onScanBadge={() => router.push({ pathname: '/scanner', params: { mode: 'badge' } })}
        onUpload={() => { void uploadCard(); }}
        onManual={() => router.push('/contacts/new')}
      />

      <ContactExportSheet
        visible={exportOpen}
        exporting={exporting}
        scopes={exportScopes}
        selectedScope={exportScope}
        selectedCount={selectedIds.size}
        onScopeChange={handleScopeChange}
        onExport={(format) => { void runExport(format); }}
        onClose={handleCloseExport}
        onEditSelection={handlePromptEditSelection}
        onCancelExport={handlePromptCancelExport}
      />

      <ExportClosePromptModal
        visible={closePromptOpen}
        selectedCount={selectedIds.size}
        onEditSelection={handlePromptEditSelection}
        onCancelExport={handlePromptCancelExport}
        onKeepExporting={handlePromptKeepExporting}
      />
    </KeyboardAvoidingView>
  );
}
