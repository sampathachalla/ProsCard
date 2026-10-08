// components/contactsComponents/Components/ContactReview.tsx
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Camera,
  Check,
  Crop,
  CreditCard,
  Globe,
  ImagePlus,
  Mail,
  MapPin,
  Maximize2,
  Notebook,
  Phone,
  RotateCw,
  ScanLine,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  type LucideIcon,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/uiComponents/Button';
import { MediaImage } from '@/components/uiComponents/MediaImage';
import { CardImageViewer } from './CardImageViewer';
import { useCardCapture, type CaptureMode } from '@/components/scannerComponents/Hooks/useCardCapture';
import { useCardReader } from '@/components/scannerComponents/Hooks/useCardReader';
import { rotateCardPhoto } from '@/components/scannerComponents/Services/cardReaderService';
import { initialsFor } from '@/components/contactsComponents/Services/contactsService';
import { saveDirectlyToNativeContacts } from '@/utils/nativeContacts';
import type { CardContactFields, ProcessedCard } from '@/components/scannerComponents/types/scanner.types';

export type ContactFieldKey = keyof CardContactFields;
export type ContactFormValues = Record<ContactFieldKey, string>;
export type ReviewNotice = { tone: 'success' | 'warning'; text: string };

type FieldConfig = {
  key: ContactFieldKey;
  label: string;
  placeholder: string;
  keyboardType?: 'email-address' | 'phone-pad' | 'url';
  multiline?: boolean;
  icon: LucideIcon;
};

const FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Full Name', placeholder: 'Name', icon: User },
  { key: 'title', label: 'Job Title', placeholder: 'Title', icon: Briefcase },
  { key: 'company', label: 'Company', placeholder: 'Company', icon: Briefcase },
  { key: 'phone', label: 'Phone', placeholder: 'Phone number', keyboardType: 'phone-pad', icon: Phone },
  { key: 'email', label: 'Email', placeholder: 'Email address', keyboardType: 'email-address', icon: Mail },
  { key: 'website', label: 'Website', placeholder: 'website.com', keyboardType: 'url', icon: Globe },
  { key: 'address', label: 'Address', placeholder: 'Street address', multiline: true, icon: MapPin },
  { key: 'notes', label: 'Notes', placeholder: 'Add note', multiline: true, icon: Notebook },
];

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: '',
  title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  notes: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTOFILL_NOTICE: ReviewNotice = {
  tone: 'success',
  text: 'Details filled from business card. Check them before saving.',
};

/** Notes belong to the user, so a card reading never fills them. */
const AUTOFILL_KEYS = FIELDS.map(({ key }) => key).filter((key) => key !== 'notes');

/** Fills only the empty fields from a card reading; returns the new values and which keys were filled. */
export function fillEmptyFields(current: ContactFormValues, fields: CardContactFields) {
  const filled = AUTOFILL_KEYS.filter((key) => fields[key]?.trim() && !current[key].trim());
  const values = { ...current, ...Object.fromEntries(filled.map((key) => [key, fields[key].trim()])) } as ContactFormValues;
  return { values, filled };
}

type ContactReviewProps = {
  contactId?: string;
  mode: 'create' | 'edit';
  initialValues: ContactFormValues;
  /** A new, unsaved card photo on the device (from the scanner or a rescan). */
  initialCard?: ProcessedCard | null;
  /** The card photo already stored for this contact. */
  storedImageUrl?: string;
  initialAutoFilled?: ContactFieldKey[];
  initialNotice?: ReviewNotice | null;
  /**
   * View mode (false) shows the saved details read-only with quick actions; edit mode (true, the default)
   * shows photo Retake/Upload, editable fields and the Save/Delete buttons.
   */
  editing?: boolean;
  /** `newCard` is set only when the user added or replaced the card photo. */
  onSave: (values: ContactFormValues, newCard: ProcessedCard | null) => Promise<void>;
  onDelete?: () => Promise<void>;
};

// Generates consistent warm avatar tone based on name
function getAvatarBgColor(name: string): string {
  const tones = ['#007AFF', '#5856D6', '#34C759', '#FF9500', '#AF52DE', '#00C7BE', '#32ADE6', '#64748b'];
  if (!name.trim()) return '#8E8E93';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % tones.length;
  return tones[index];
}

/**
 * iOS Apple Contacts style review and detail screen.
 */
export function ContactReview({
  contactId,
  mode,
  initialValues,
  initialCard = null,
  storedImageUrl,
  initialAutoFilled = [],
  initialNotice = null,
  editing = true,
  onSave,
  onDelete,
}: ContactReviewProps) {
  const insets = useSafeAreaInsets();
  const [card, setCard] = useState<ProcessedCard | null>(initialCard);
  const [form, setForm] = useState(initialValues);
  const [autoFilled, setAutoFilled] = useState<ContactFieldKey[]>(initialAutoFilled);
  const [notice, setNotice] = useState<ReviewNotice | null>(initialNotice);
  const [errors, setErrors] = useState<Partial<Record<ContactFieldKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [savingToPhone, setSavingToPhone] = useState(false);
  const { busy: capturing, captureCard } = useCardCapture();
  const reader = useCardReader();
  const formRef = useRef(form);

  const handleSaveToPhoneContacts = async () => {
    if (savingToPhone) return;
    setSavingToPhone(true);
    try {
      await saveDirectlyToNativeContacts({
        name: form.name,
        title: form.title,
        company: form.company,
        phone: form.phone,
        email: form.email,
        website: form.website,
        address: form.address,
        note: form.notes,
        photoUrl: card?.uri || storedImageUrl,
      });
    } finally {
      setSavingToPhone(false);
    }
  };

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const reading = reader.status === 'reading';
  const hasPhoto = Boolean(card || storedImageUrl);
  const busy = saving || deleting || capturing || reading || rotating;
  // Double-tap the card photo to see it full screen; single taps still reach the buttons on top of it.
  const openViewer = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onEnd(() => {
      if (hasPhoto && !reading) setViewerOpen(true);
    });

  const setField = (key: ContactFieldKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /** Replaces the card photo and fills any empty fields from it. */
  const replaceCard = async (captureMode: CaptureMode) => {
    const next = await captureCard(captureMode);
    if (!next) return;
    const previous = card;
    setCard(next);
    setNotice(null);
    const result = await reader.read(next);
    if (result.status === 'stale') return;
    if (result.status === 'notACard') {
      setCard(previous);
      Alert.alert(
        'No business card found',
        'We couldn’t find a business card in that photo. Try again with a clear photo of the card.',
        [
          { text: 'Take photo', onPress: () => { void replaceCard('scan'); } },
          { text: 'Upload photo', onPress: () => { void replaceCard('library'); } },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    if (result.status !== 'done') {
      setNotice({ tone: 'warning', text: 'Couldn’t read the card. The photo was added; enter the details yourself.' });
      return;
    }
    setCard(result.card);
    const { values, filled } = fillEmptyFields(formRef.current, result.reading.contact);
    setForm(values);
    setAutoFilled(filled);
    setNotice(filled.length ? AUTOFILL_NOTICE : null);
  };

  const rotate = async () => {
    if (!card || rotating) return;
    setRotating(true);
    try {
      const uri = await rotateCardPhoto(card.uri);
      setCard({ ...card, uri, mimeType: 'image/jpeg', fileName: undefined });
    } catch {
      Alert.alert('Rotate failed', 'Could not rotate the photo. Please try again.');
    } finally {
      setRotating(false);
    }
  };

  const toggleCrop = () => {
    if (!card?.originalUri) return;
    setCard({ ...card, uri: card.originalUri, originalUri: card.uri, autoCropped: !card.autoCropped });
  };

  const validate = () => {
    const next: Partial<Record<ContactFieldKey, string>> = {};
    if (!form.name.trim()) next.name = 'Enter the person’s name.';
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (busy || !validate()) return;
    setSaving(true);
    try {
      const values = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value.trim()])
      ) as ContactFormValues;
      await onSave(values, card);
    } catch (reason) {
      Alert.alert('Save failed', reason instanceof Error ? reason.message : 'Could not save this contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!onDelete || busy) return;
    Alert.alert('Delete Contact', `Are you sure you want to delete ${form.name || 'this contact'}? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Contact',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await onDelete();
          } catch (reason) {
            Alert.alert('Delete failed', reason instanceof Error ? reason.message : 'Please try again.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const openLink = (url: string, failure: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Could not open', failure));
  };

  const initials = initialsFor(form.name);
  const avatarBg = getAvatarBgColor(form.name);
  const cleanedPhone = form.phone.trim().replace(/[^\d+]/g, '');
  const cleanedEmail = form.email.trim();
  const cleanedWebsite = form.website.trim();
  const formattedWebsiteUrl = cleanedWebsite
    ? /^https?:\/\//i.test(cleanedWebsite)
      ? cleanedWebsite
      : `https://${cleanedWebsite}`
    : '';


  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===================== HERO PROFILE HEADER ===================== */}
        <View className="items-center justify-center pt-2 pb-5">
          {/* Avatar Circle */}
          <View className="relative">
            <View
              className="w-24 h-24 rounded-full items-center justify-center shadow-md"
              style={{ backgroundColor: avatarBg }}
            >
              <Text className="text-white text-3xl font-bold tracking-wider">{initials}</Text>
            </View>

            {editing && !reading && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Scan or change business card photo"
                onPress={() => { void replaceCard('scan'); }}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-background dark:border-dark-background shadow-sm"
              >
                <Camera color="#FFFFFF" size={15} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Name & Title in View / Edit Mode */}
          {editing ? (
            <View className="w-full mt-4 items-center">
              <TextInput
                value={form.name}
                onChangeText={(value) => setField('name', value)}
                placeholder="Full Name *"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                className={`text-2xl font-bold text-center text-textPrimary dark:text-dark-textPrimary px-4 py-1.5 w-full ${
                  errors.name ? 'border-b border-red-500' : ''
                }`}
              />
              {errors.name && <Text className="mt-1 text-xs text-red-500">{errors.name}</Text>}

              <View className="flex-row items-center justify-center gap-2 mt-1 px-4 w-full">
                <TextInput
                  value={form.title}
                  onChangeText={(value) => setField('title', value)}
                  placeholder="Job Title"
                  placeholderTextColor="#94a3b8"
                  className="text-sm font-medium text-center text-textMuted dark:text-dark-textMuted py-1 flex-1"
                />
                <Text className="text-textMuted dark:text-dark-textMuted">·</Text>
                <TextInput
                  value={form.company}
                  onChangeText={(value) => setField('company', value)}
                  placeholder="Company"
                  placeholderTextColor="#94a3b8"
                  className="text-sm font-medium text-center text-textMuted dark:text-dark-textMuted py-1 flex-1"
                />
              </View>
            </View>
          ) : (
            <View className="items-center mt-3 px-4 w-full">
              <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary text-center">
                {form.name || 'Unnamed Contact'}
              </Text>
              {(form.title.trim() || form.company.trim()) ? (
                <Text className="mt-1 text-sm font-medium text-textMuted dark:text-dark-textMuted text-center">
                  {[form.title.trim(), form.company.trim()].filter(Boolean).join(' · ')}
                </Text>
              ) : null}

              {/* Save to Phone Contacts Button */}
              <View className="mt-4 w-full max-w-sm">
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Save contact to phone contacts"
                  disabled={savingToPhone}
                  onPress={handleSaveToPhoneContacts}
                  activeOpacity={0.8}
                  className="flex-row items-center justify-center py-3.5 px-6 rounded-2xl bg-primary shadow-sm"
                >
                  {savingToPhone ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <UserPlus color="#FFFFFF" size={18} strokeWidth={2.4} />
                      <Text className="ml-2 font-semibold text-white text-base">
                        Save to Phone Contacts
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ===================== NOTICES & AUTOFILL ===================== */}
        {notice ? (
          <View
            className={`mb-4 flex-row items-center rounded-2xl px-4 py-3 border ${
              notice.tone === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/20'
            }`}
          >
            {notice.tone === 'success' ? <Sparkles color="#059669" size={16} /> : <AlertCircle color="#D97706" size={16} />}
            <Text className="ml-2.5 flex-1 text-xs font-medium text-textPrimary dark:text-dark-textPrimary">
              {notice.text}
            </Text>
          </View>
        ) : null}

        {/* ===================== INSET GROUPED DETAILS ===================== */}
        <View className="space-y-4">
          {/* GROUP 1: Contact Methods (Phone, Email, Website) */}
          {(editing || form.phone.trim() || form.email.trim() || form.website.trim()) && (
            <View className="rounded-2xl bg-card dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm mb-3">
              {/* Phone */}
              {(editing || form.phone.trim()) && (
                <TouchableOpacity
                  disabled={editing || !form.phone.trim()}
                  onPress={() => cleanedPhone && openLink(`tel:${cleanedPhone}`, `Could not call ${form.phone}`)}
                  className="px-4 py-3 flex-row items-center justify-between active:bg-black/5 dark:active:bg-white/5"
                >
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-medium text-primary dark:text-[#38bdf8]">phone</Text>
                      {autoFilled.includes('phone') && <Sparkles color="#059669" size={11} style={{ marginLeft: 4 }} />}
                    </View>
                    {editing ? (
                      <TextInput
                        value={form.phone}
                        onChangeText={(v) => setField('phone', v)}
                        placeholder="Add phone"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 p-0 font-normal"
                      />
                    ) : (
                      <Text className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 font-normal">
                        {form.phone}
                      </Text>
                    )}
                  </View>
                  {!editing && form.phone.trim() ? (
                    <Phone color={Colors.light.tint} size={16} strokeWidth={2} />
                  ) : null}
                </TouchableOpacity>
              )}

              {/* Divider */}
              {(editing || form.phone.trim()) && (editing || form.email.trim() || form.website.trim()) && (
                <View className="h-[1px] bg-slate-100 dark:bg-slate-800/80 ml-4" />
              )}

              {/* Email */}
              {(editing || form.email.trim()) && (
                <TouchableOpacity
                  disabled={editing || !form.email.trim()}
                  onPress={() => cleanedEmail && openLink(`mailto:${cleanedEmail}`, `Could not email ${form.email}`)}
                  className="px-4 py-3 flex-row items-center justify-between active:bg-black/5 dark:active:bg-white/5"
                >
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-medium text-primary dark:text-[#38bdf8]">email</Text>
                      {autoFilled.includes('email') && <Sparkles color="#059669" size={11} style={{ marginLeft: 4 }} />}
                    </View>
                    {editing ? (
                      <TextInput
                        value={form.email}
                        onChangeText={(v) => setField('email', v)}
                        placeholder="Add email"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 p-0 font-normal"
                      />
                    ) : (
                      <Text className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 font-normal">
                        {form.email}
                      </Text>
                    )}
                    {errors.email && <Text className="mt-1 text-xs text-red-500">{errors.email}</Text>}
                  </View>
                  {!editing && form.email.trim() ? (
                    <Mail color={Colors.light.tint} size={16} strokeWidth={2} />
                  ) : null}
                </TouchableOpacity>
              )}

              {/* Divider */}
              {(editing || form.email.trim()) && (editing || form.website.trim()) && (
                <View className="h-[1px] bg-slate-100 dark:bg-slate-800/80 ml-4" />
              )}

              {/* Website */}
              {(editing || form.website.trim()) && (
                <TouchableOpacity
                  disabled={editing || !formattedWebsiteUrl}
                  onPress={() => formattedWebsiteUrl && openLink(formattedWebsiteUrl, `Could not open ${form.website}`)}
                  className="px-4 py-3 flex-row items-center justify-between active:bg-black/5 dark:active:bg-white/5"
                >
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-medium text-primary dark:text-[#38bdf8]">website</Text>
                      {autoFilled.includes('website') && <Sparkles color="#059669" size={11} style={{ marginLeft: 4 }} />}
                    </View>
                    {editing ? (
                      <TextInput
                        value={form.website}
                        onChangeText={(v) => setField('website', v)}
                        placeholder="Add website URL"
                        placeholderTextColor="#94a3b8"
                        keyboardType="url"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 p-0 font-normal"
                      />
                    ) : (
                      <Text className="text-base text-primary dark:text-[#38bdf8] mt-0.5 font-normal">
                        {form.website}
                      </Text>
                    )}
                  </View>
                  {!editing && formattedWebsiteUrl ? (
                    <Globe color={Colors.light.tint} size={16} strokeWidth={2} />
                  ) : null}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* GROUP 2: Work & Organization (Title & Company in View Mode) */}
          {!editing && (form.title.trim() || form.company.trim()) && (
            <View className="rounded-2xl bg-card dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm mb-3">
              {form.title.trim() && (
                <View className="px-4 py-3 flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-medium text-textMuted dark:text-dark-textMuted">job title</Text>
                    <Text className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 font-normal">
                      {form.title}
                    </Text>
                  </View>
                  <Briefcase color={Colors.light.tint} size={16} strokeWidth={2} />
                </View>
              )}
              {form.title.trim() && form.company.trim() && (
                <View className="h-[1px] bg-slate-100 dark:bg-slate-800/80 ml-4" />
              )}
              {form.company.trim() && (
                <View className="px-4 py-3 flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-medium text-textMuted dark:text-dark-textMuted">company</Text>
                    <Text className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 font-normal">
                      {form.company}
                    </Text>
                  </View>
                  <Building2 color={Colors.light.tint} size={16} strokeWidth={2} />
                </View>
              )}
            </View>
          )}

          {/* GROUP 3: Address */}
          {(editing || form.address.trim()) && (
            <View className="rounded-2xl bg-card dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm mb-3">
              <TouchableOpacity
                disabled={editing || !form.address.trim()}
                onPress={() => {
                  const query = encodeURIComponent(form.address.trim());
                  openLink(`https://maps.apple.com/?q=${query}`, `Could not open maps for ${form.address}`);
                }}
                className="px-4 py-3 flex-row items-center justify-between active:bg-black/5 dark:active:bg-white/5"
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center">
                    <Text className="text-xs font-medium text-primary dark:text-[#38bdf8]">address</Text>
                    {autoFilled.includes('address') && <Sparkles color="#059669" size={11} style={{ marginLeft: 4 }} />}
                  </View>
                  {editing ? (
                    <TextInput
                      value={form.address}
                      onChangeText={(v) => setField('address', v)}
                      placeholder="Add address"
                      placeholderTextColor="#94a3b8"
                      multiline
                      className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 p-0 font-normal min-h-[44px]"
                    />
                  ) : (
                    <Text className="text-base text-textPrimary dark:text-dark-textPrimary mt-0.5 font-normal">
                      {form.address}
                    </Text>
                  )}
                </View>
                {!editing && form.address.trim() ? (
                  <MapPin color={Colors.light.tint} size={16} strokeWidth={2} />
                ) : null}
              </TouchableOpacity>
            </View>
          )}

          {/* GROUP 4: Notes */}
          {(editing || form.notes.trim()) && (
            <View className="rounded-2xl bg-card dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm mb-3">
              <View className="px-4 py-3">
                <Text className="text-xs font-medium text-textMuted dark:text-dark-textMuted">notes</Text>
                {editing ? (
                  <TextInput
                    value={form.notes}
                    onChangeText={(v) => setField('notes', v)}
                    placeholder="Add notes about this contact..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={3}
                    className="text-base text-textPrimary dark:text-dark-textPrimary mt-1.5 p-0 font-normal min-h-[64px]"
                  />
                ) : (
                  <Text className="text-base text-textPrimary dark:text-dark-textPrimary mt-1 font-normal leading-relaxed">
                    {form.notes}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* GROUP 5: Business Card Section */}
          {(hasPhoto || editing) && (
            <View className="rounded-2xl bg-card dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm mb-4">
              <View className="px-4 py-3 flex-row items-center justify-between border-b border-black/5 dark:border-white/10">
                <View className="flex-row items-center">
                  <CreditCard color="#94a3b8" size={15} strokeWidth={2} />
                  <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted ml-1.5 uppercase tracking-wide">
                    Business Card
                  </Text>
                </View>
                {card && (card.edgeDetected || card.autoCropped) ? (
                  <View className="flex-row items-center rounded-full bg-emerald-500/15 px-2 py-0.5">
                    <Check color="#059669" size={11} strokeWidth={3} />
                    <Text className="ml-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {card.edgeDetected ? 'Card detected' : 'Cropped'}
                    </Text>
                  </View>
                ) : null}
              </View>

              <GestureDetector gesture={openViewer}>
              <View
                accessibilityHint={hasPhoto ? 'Double tap to view the card photo full screen' : undefined}
                className="relative overflow-hidden bg-slate-100 dark:bg-black/40"
                style={{ aspectRatio: 1.586 }}
              >
                {card ? (
                  <Image source={{ uri: card.uri }} style={{ flex: 1 }} contentFit="contain" transition={120} />
                ) : storedImageUrl ? (
                  <MediaImage sourceUrl={storedImageUrl} style={{ flex: 1 }} contentFit="contain" accessibilityLabel="Business card" />
                ) : (
                  <View className="flex-1 items-center justify-center px-6">
                    <CreditCard color="#94a3b8" size={36} strokeWidth={1.5} />
                    <Text className="mt-2 text-center text-xs text-textMuted dark:text-dark-textMuted">
                      No business card photo attached
                    </Text>
                  </View>
                )}

                {/* Edit overlays: Scan / Upload / Rotate / Crop */}
                {editing && !reading && (
                  <View pointerEvents="box-none" className={`absolute inset-0 items-center justify-center p-3 ${hasPhoto ? 'bg-black/40' : ''}`}>
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={hasPhoto ? 'Retake business card photo' : 'Scan business card'}
                        disabled={busy}
                        onPress={() => { void replaceCard('scan'); }}
                        className="flex-row items-center justify-center rounded-full bg-black/85 px-4 py-2.5 border border-white/20 shadow-md"
                      >
                        <ScanLine color="#FFFFFF" size={16} strokeWidth={2.2} />
                        <Text className="ml-2 text-xs font-bold text-white">
                          {hasPhoto ? 'Retake' : 'Scan Card'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Upload photo from library"
                        disabled={busy}
                        onPress={() => { void replaceCard('library'); }}
                        className="flex-row items-center justify-center rounded-full bg-black/85 px-4 py-2.5 border border-white/20 shadow-md"
                      >
                        <ImagePlus color="#FFFFFF" size={16} strokeWidth={2.2} />
                        <Text className="ml-2 text-xs font-bold text-white">Upload</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Top-right card photo tools (Rotate / Toggle Crop) */}
                {editing && card && !reading && (
                  <View className="absolute right-2.5 top-2.5 flex-row gap-2">
                    {card.originalUri && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={card.autoCropped ? 'Show full photo' : 'Crop to card'}
                        onPress={toggleCrop}
                        className="h-8 flex-row items-center rounded-full bg-black/75 px-2.5 border border-white/20"
                      >
                        {card.autoCropped ? <Maximize2 color="#FFFFFF" size={13} /> : <Crop color="#FFFFFF" size={13} />}
                        <Text className="ml-1 text-[11px] font-semibold text-white">
                          {card.autoCropped ? 'Full' : 'Crop'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Rotate photo"
                      disabled={rotating}
                      onPress={rotate}
                      className="h-8 w-8 items-center justify-center rounded-full bg-black/75 border border-white/20"
                    >
                      {rotating ? <ActivityIndicator color="#FFFFFF" size="small" /> : <RotateCw color="#FFFFFF" size={14} />}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Reading spinner */}
                {reading && (
                  <View className="absolute inset-0 items-center justify-center bg-black/65">
                    <ActivityIndicator color="#FFFFFF" size="large" />
                    <Text className="mt-2.5 text-xs font-semibold text-white">Reading Card…</Text>
                  </View>
                )}
              </View>
              </GestureDetector>
            </View>
          )}

          <CardImageViewer
            visible={viewerOpen}
            onClose={() => setViewerOpen(false)}
            localUri={card?.uri}
            storedUrl={card ? undefined : storedImageUrl}
          />
        </View>

        {/* ===================== BOTTOM ACTION BUTTONS (EDIT MODE) ===================== */}
        {editing && (
          <View className="mt-2 mb-6">
            <Button
              label={mode === 'create' ? 'Save Contact' : 'Save Changes'}
              icon={Check}
              loading={saving}
              disabled={busy && !saving}
              onPress={save}
            />

            {onDelete && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Delete contact"
                disabled={busy}
                onPress={confirmDelete}
                className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 active:bg-red-500/20"
                style={busy && !deleting ? { opacity: 0.5 } : undefined}
              >
                {deleting ? (
                  <ActivityIndicator color={Colors.palette.error} />
                ) : (
                  <>
                    <Trash2 color={Colors.palette.error} size={16} strokeWidth={2} />
                    <Text className="ml-2 font-semibold text-red-500 text-sm">Delete Contact</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

