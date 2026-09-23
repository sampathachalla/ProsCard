import { useMemo } from 'react';
import { Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react-native';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import type { CardSectionFieldId, CardSectionId, CardTemplateId, CardVisualTheme, DynamicCardField, DynamicCardFieldType } from '@/components/cardsComponents/types/card.types';
import { createCardDetailTemplate } from '@/components/cardsComponents/Templates/cardDetailTemplate';
import { Text } from '@/components/uiComponents/Text';
import type { EditHomeTab } from '@/components/uiComponents/EditHomeBar';
import type { EditableCard } from '../types/editView.types';
import { CardThemeCustomizer } from './CardThemeCustomizer';

const SECTIONS: { id: CardSectionId; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'professional', label: 'Professional' },
  { id: 'bio', label: 'About' },
  { id: 'connections', label: 'Contact & links' },
];
const TEMPLATES: { id: CardTemplateId; label: string }[] = [
  { id: 'classic', label: 'Classic' }, { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold Gradient' }, { id: 'glass', label: 'Glass' },
];
const IDENTITY_TEMPLATE_NAMES: Record<CardTemplateId, string> = {
  classic: 'Cover Overlay',
  minimal: 'Side Profile',
  bold: 'Hero Banner',
  glass: 'Centered Glass',
};
const SECTION_FIELDS: Record<Exclude<CardSectionId, 'connections'>, { id: CardSectionFieldId; label: string; multiline?: boolean }[]> = {
  identity: [
    { id: 'preferredName', label: 'Preferred name' }, { id: 'coverPhoto', label: 'Cover photo URL' },
    { id: 'profilePhoto', label: 'Profile photo URL' }, { id: 'logo', label: 'Logo URL' },
  ],
  professional: [
    { id: 'tagline', label: 'Tagline' }, { id: 'accreditations', label: 'Accreditations' },
    { id: 'prefix', label: 'Prefix' }, { id: 'suffix', label: 'Suffix' },
    { id: 'firstName', label: 'First name' }, { id: 'middleName', label: 'Middle name' },
    { id: 'lastName', label: 'Last name' }, { id: 'title', label: 'Job title' }, { id: 'company', label: 'Company name' },
  ],
  bio: [{ id: 'bio', label: 'Bio', multiline: true }],
};

function EditorInput({ label, multiline, onChangeText, value }: { label: string; multiline?: boolean; onChangeText: (value: string) => void; value: string }) {
  return <View className="mb-3"><Text className="mb-1 ml-1 text-xs font-bold uppercase text-textMuted dark:text-dark-textMuted">{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={label} placeholderTextColor="#94a3b8" multiline={multiline} className="rounded-2xl border border-slate-200 bg-card px-4 py-3 text-textPrimary dark:border-slate-700 dark:bg-dark-card dark:text-dark-textPrimary" style={multiline ? { minHeight: 100, textAlignVertical: 'top' } : undefined} /></View>;
}

function LayoutThumbnail({ identity, template }: { identity: boolean; template: CardTemplateId }) {
  if (!identity) {
    return <View className={`mb-2 h-12 rounded-xl ${template === 'bold' ? 'bg-primary' : template === 'glass' ? 'bg-cyan-100/60 dark:bg-cyan-900/30' : template === 'minimal' ? 'border-l-2 border-primary' : 'bg-slate-100 dark:bg-slate-800'}`} />;
  }

  if (template === 'minimal') {
    return <View className="relative mb-2 h-12 overflow-hidden rounded-xl bg-slate-800"><View className="h-full w-[42%] bg-cyan-700" /><View className="absolute left-3 top-3 h-6 w-6 rounded-full border-2 border-white bg-slate-300" /><View className="absolute right-2 top-2 h-2 w-7 rounded bg-cyan-300" /><View className="absolute bottom-2 right-2 h-1.5 w-10 rounded bg-white" /></View>;
  }
  if (template === 'bold') {
    return <View className="relative mb-2 h-12 overflow-hidden rounded-xl bg-blue-600"><View className="absolute right-2 top-2 h-2 w-7 rounded bg-white" /><View className="absolute bottom-2 left-2 h-5 w-5 rounded-md border border-white bg-slate-300" /><View className="absolute bottom-2 left-9 h-2 w-12 rounded bg-white" /></View>;
  }
  if (template === 'glass') {
    return <View className="relative mb-2 h-12 overflow-hidden rounded-xl bg-violet-500"><View className="absolute inset-x-2 bottom-1 h-7 items-center rounded-lg border border-white/50 bg-black/30"><View className="-mt-2 h-4 w-4 rounded-full border border-white bg-slate-300" /><View className="mt-1 h-1.5 w-9 rounded bg-white" /></View></View>;
  }
  return <View className="relative mb-2 h-12 overflow-hidden rounded-xl bg-cyan-600"><View className="absolute left-2 top-2 h-2 w-7 rounded bg-white" /><View className="absolute inset-x-0 bottom-0 h-4 bg-slate-100" /><View className="absolute bottom-1 left-2 h-5 w-5 rounded-full border border-white bg-slate-300" /><View className="absolute bottom-2 left-9 h-1.5 w-10 rounded bg-slate-700" /></View>;
}

export function CardSectionEditor({ activeEditTab, activeSection, card, onActiveSectionChange, onConnectionsChange, onFieldChange, onLayoutChange, onThemeChange, profile, showSectionNavigation = true }: {
  activeEditTab: EditHomeTab; activeSection: CardSectionId; card: EditableCard; profile: Profile;
  onActiveSectionChange: (section: CardSectionId) => void;
  onConnectionsChange: (fields: DynamicCardField[]) => void;
  onFieldChange: (field: CardSectionFieldId, value: string) => void;
  onLayoutChange: (section: CardSectionId, template: CardTemplateId) => void;
  onThemeChange: (section: CardSectionId, theme: CardVisualTheme) => void;
  showSectionNavigation?: boolean;
}) {
  const { width } = useWindowDimensions();
  const sections = useMemo(() => createCardDetailTemplate(card, profile), [card, profile]);
  const section = sections.find((item) => item.id === activeSection)!;
  const editorPaneWidth = Math.min(720, Math.max(260, width - 48));
  const layoutCardWidth = Math.max(164, Math.min(240, editorPaneWidth * 0.72));
  const resolvedValues = Object.fromEntries(section.fields.map((field) => [field.id, field.value]));
  const connectionFields = card.connectionFieldsCustomized ? card.connectionFields : section.fields.map((field) => ({ id: field.id, title: field.title, type: field.type === 'image' || field.type === 'multiline' ? 'text' : field.type, value: field.value } as DynamicCardField));

  const changeConnection = (index: number, patch: Partial<DynamicCardField>) => onConnectionsChange(connectionFields.map((field, i) => i === index ? { ...field, ...patch } : field));
  const move = (index: number, direction: -1 | 1) => { const next = [...connectionFields]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; onConnectionsChange(next); };

  const layoutZone = (
    <View>
      <Text className="mb-2 text-xs font-bold uppercase text-textMuted dark:text-dark-textMuted">Choose a design</Text>
      <ScrollView
        horizontal
        nestedScrollEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        snapToInterval={layoutCardWidth + 12}
        snapToAlignment="start"
        style={{ height: 124 }}
        contentContainerStyle={{ gap: 12, paddingRight: Math.max(24, editorPaneWidth - layoutCardWidth - 24) }}
      >
        {TEMPLATES.map((template) => {
          const label = activeSection === 'identity' ? IDENTITY_TEMPLATE_NAMES[template.id] : template.label;
          const selected = section.templateId === template.id;
          return (
            <Pressable accessibilityLabel={`Use ${label} layout`} accessibilityRole="button" accessibilityState={{ selected }} key={template.id} onPress={() => onLayoutChange(activeSection, template.id)} className={`rounded-2xl border p-3 ${selected ? 'border-primary bg-blue-50 dark:border-dark-primary dark:bg-blue-950/30' : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'}`} style={{ height: 112, width: layoutCardWidth }}>
              <LayoutThumbnail identity={activeSection === 'identity'} template={template.id} />
              <View className="flex-row items-center justify-between"><Text className="flex-1 text-xs font-bold text-textPrimary dark:text-dark-textPrimary">{label}</Text>{selected ? <View className="ml-2 h-2.5 w-2.5 rounded-full bg-primary dark:bg-dark-primary" /> : null}</View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const contentZone = activeSection !== 'connections'
    ? <View>{SECTION_FIELDS[activeSection].map((field) => <EditorInput key={field.id} label={field.label} multiline={field.multiline} value={card.sectionOverrides[field.id] ?? resolvedValues[field.id] ?? ''} onChangeText={(value) => onFieldChange(field.id, value)} />)}</View>
    : <View>{connectionFields.map((field, index) => <View key={field.id} className="mb-3 rounded-2xl border border-slate-200 bg-card p-3 dark:border-slate-700 dark:bg-dark-card"><EditorInput label="Title" value={field.title} onChangeText={(value) => changeConnection(index, { title: value })} /><View className="mb-3 flex-row flex-wrap gap-2">{(['text', 'email', 'phone', 'url'] as DynamicCardFieldType[]).map((type) => <Pressable key={type} onPress={() => changeConnection(index, { type })} className={`rounded-full px-3 py-1.5 ${field.type === type ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}`}><Text className={field.type === type ? 'text-xs font-bold text-white' : 'text-xs text-textPrimary dark:text-dark-textPrimary'}>{type}</Text></Pressable>)}</View><EditorInput label="Value" value={field.value} onChangeText={(value) => changeConnection(index, { value })} /><View className="flex-row justify-end gap-2"><Pressable onPress={() => move(index, -1)} className="p-2"><ChevronUp color="#64748b" size={18} /></Pressable><Pressable onPress={() => move(index, 1)} className="p-2"><ChevronDown color="#64748b" size={18} /></Pressable><Pressable onPress={() => onConnectionsChange(connectionFields.filter((_, i) => i !== index))} className="p-2"><Trash2 color="#ef4444" size={18} /></Pressable></View></View>)}<Pressable onPress={() => onConnectionsChange([...connectionFields, { id: `custom-${Date.now()}`, title: 'Custom field', type: 'text', value: '' }])} className="mb-5 flex-row items-center justify-center rounded-2xl border border-dashed border-primary py-3"><Plus color="#3b82f6" size={18} /><Text className="ml-2 font-bold text-primary dark:text-dark-primary">Add field</Text></Pressable></View>;

  const editZone = (
    <View style={{ width: editorPaneWidth, maxWidth: '100%', alignSelf: 'center' }}>
      <View className="rounded-[24px] border border-slate-200 bg-background p-4 dark:border-slate-700 dark:bg-dark-background">
        {activeEditTab === 'layout' ? layoutZone : activeEditTab === 'theme' ? <CardThemeCustomizer theme={card.sectionThemes[activeSection]} onChange={(theme) => onThemeChange(activeSection, theme)} /> : contentZone}
      </View>
    </View>
  );

  return (
    <View>
      {showSectionNavigation ? <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">{SECTIONS.map((item) => <Pressable key={item.id} onPress={() => onActiveSectionChange(item.id)} className={`mr-2 rounded-full px-4 py-2 ${activeSection === item.id ? 'bg-primary dark:bg-dark-primary' : 'bg-card dark:bg-dark-card'}`}><Text className={activeSection === item.id ? 'font-bold text-white' : 'font-semibold text-textPrimary dark:text-dark-textPrimary'}>{item.label}</Text></Pressable>)}</ScrollView> : null}
      {editZone}
    </View>
  );
}
