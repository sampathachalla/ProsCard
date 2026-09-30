// app/contacts/new.tsx
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, Check, Crop, CreditCard, ImagePlus, Maximize2, RotateCw, ScanLine, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/uiComponents/Button';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { createContactWithCard, initialsFor } from '@/components/contactsComponents/Services/contactsService';
import { useCardCapture } from '@/components/scannerComponents/Hooks/useCardCapture';
import { useCardReader } from '@/components/scannerComponents/Hooks/useCardReader';
import { rotateCardPhoto } from '@/components/scannerComponents/Services/cardReaderService';
import type { CapturedCard, CardCaptureSource, ProcessedCard } from '@/components/scannerComponents/types/scanner.types';
import { queryClient, queryKeys } from '@/services/api/queryClient';

type Params = {
  imageUri?: string;
  source?: CardCaptureSource;
  edgeDetected?: string;
  mimeType?: string;
  fileName?: string;
};

type FieldKey = 'name' | 'title' | 'company' | 'phone' | 'email' | 'website' | 'address' | 'notes';
type Field = { key: FieldKey; label: string; keyboardType?: 'email-address' | 'phone-pad' | 'url'; multiline?: boolean };

const FIELDS: Field[] = [
  { key: 'name', label: 'Full name *' },
  { key: 'title', label: 'Job title' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
  { key: 'website', label: 'Website', keyboardType: 'url' },
  { key: 'address', label: 'Address' },
  { key: 'notes', label: 'Notes', multiline: true },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_FORM: Record<FieldKey, string> = { name: '', title: '', company: '', phone: '', email: '', website: '', address: '', notes: '' };

/** Asks for a new photo after the reader found no business card in the last one. */
function promptForCardPhoto(onChoose: (mode: 'scan' | 'library') => void) {
  Alert.alert(
    'No business card found',
    'We couldn’t find a business card in that photo. Take or upload a clear photo of the card.',
    [
      { text: 'Take photo', onPress: () => onChoose('scan') },
      { text: 'Upload photo', onPress: () => onChoose('library') },
      { text: 'Enter manually', style: 'cancel' },
    ],
  );
}

function cardFromParams(params: Params): CapturedCard | null {
  if (!params.imageUri) return null;
  return {
    uri: params.imageUri,
    source: params.source ?? 'library',
    edgeDetected: params.edgeDetected === '1',
    mimeType: params.mimeType,
    fileName: params.fileName,
  };
}

export default function NewContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();
  const [card, setCard] = useState<ProcessedCard | null>(() => cardFromParams(params));
  const [form, setForm] = useState(EMPTY_FORM);
  const [autoFilled, setAutoFilled] = useState<FieldKey[]>([]);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const { busy: capturing, captureCard } = useCardCapture();
  const reader = useCardReader();
  const initialCard = useRef(card);
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const setField = (key: FieldKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /**
   * Reads the card, crops the photo to it, and fills only the fields the user has not typed yet.
   * Resolves to false when the photo is not a business card.
   */
  const processCard = async (next: CapturedCard): Promise<boolean> => {
    setCard(next);
    setAutoFilled([]);
    const result = await reader.read(next);
    if (!result) return true;
    if (!result.reading.isBusinessCard) {
      // Drop the photo so a non-card image is never saved to the contact.
      setCard(null);
      return false;
    }
    setCard(result.card);
    // Inputs are locked while reading, so the form cannot change between the read starting and now.
    const current = formRef.current;
    const filled = FIELDS.map(({ key }) => key).filter((key) => result.reading.contact[key]?.trim() && !current[key].trim());
    setForm({ ...current, ...Object.fromEntries(filled.map((key) => [key, result.reading.contact[key].trim()])) });
    setAutoFilled(filled);
    return true;
  };

  const replaceCard = async (mode: 'scan' | 'library') => {
    const next = await captureCard(mode);
    if (next && !(await processCard(next))) promptForCardPhoto((again) => { void replaceCard(again); });
  };

  useEffect(() => {
    const photo = initialCard.current;
    if (!photo) return;
    void processCard(photo).then((isCard) => {
      if (!isCard) promptForCardPhoto((mode) => { void replaceCard(mode); });
    });
    // Runs once for the photo this screen was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
    // Swap the cropped and full photos so the user can switch back and forth.
    setCard({ ...card, uri: card.originalUri, originalUri: card.uri, autoCropped: !card.autoCropped });
  };

  const validate = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!form.name.trim()) next.name = 'Enter the person’s name.';
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (saving || !validate()) return;
    setSaving(true);
    try {
      const values = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])) as Record<FieldKey, string>;
      const { imageError } = await createContactWithCard(
        { ...values, initials: initialsFor(values.name), color: Colors.light.tint, sourceCardId: null },
        card,
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      if (imageError) {
        Alert.alert('Contact saved', `The card photo could not be uploaded: ${imageError.message}`);
      }
      router.dismissTo('/(tabs)/contactsPage');
    } catch (reason) {
      Alert.alert('Save failed', reason instanceof Error ? reason.message : 'Could not save this contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const reading = reader.status === 'reading';
  const readNotice =
    reader.status === 'done'
      ? autoFilled.length
        ? { tone: 'success' as const, text: 'Details filled from the card. Check them before saving.' }
        : null
      : reader.status === 'notACard'
        ? { tone: 'warning' as const, text: 'That photo wasn’t a business card. Scan or upload the card, or enter the details yourself.' }
        : reader.status === 'failed'
          ? { tone: 'warning' as const, text: 'Couldn’t read the card. Try again or enter the details yourself.' }
          : null;

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="New Contact" subtitle={card ? 'Review the details from the card' : 'Scan a card or enter details'} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20) + 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="overflow-hidden rounded-3xl border border-black/5 bg-card dark:border-white/10 dark:bg-dark-card" style={{ aspectRatio: 1.586 }}>
            {card ? (
              <>
                <Image source={{ uri: card.uri }} style={{ flex: 1 }} contentFit="contain" transition={120} />
                {card.edgeDetected || card.autoCropped ? (
                  <View className="absolute left-3 top-3 flex-row items-center rounded-full bg-black/70 px-3 py-1.5">
                    <Check color={Colors.palette.successLight} size={14} strokeWidth={3} />
                    <Text className="ml-1.5 text-xs font-semibold text-white">{card.edgeDetected ? 'Edges detected' : 'Cropped to card'}</Text>
                  </View>
                ) : null}
                {!reading ? (
                  <View className="absolute bottom-3 right-3 flex-row gap-2">
                    {card.originalUri ? (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={card.autoCropped ? 'Show full photo' : 'Crop to card'}
                        onPress={toggleCrop}
                        className="h-9 flex-row items-center rounded-full bg-black/70 px-3"
                      >
                        {card.autoCropped ? <Maximize2 color="#FFFFFF" size={15} /> : <Crop color="#FFFFFF" size={15} />}
                        <Text className="ml-1.5 text-xs font-semibold text-white">{card.autoCropped ? 'Full photo' : 'Crop'}</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Rotate photo"
                      disabled={rotating}
                      onPress={rotate}
                      className="h-9 w-9 items-center justify-center rounded-full bg-black/70"
                    >
                      {rotating ? <ActivityIndicator color="#FFFFFF" size="small" /> : <RotateCw color="#FFFFFF" size={16} />}
                    </TouchableOpacity>
                  </View>
                ) : null}
                {reading ? (
                  <View className="absolute inset-0 items-center justify-center bg-black/55">
                    <ActivityIndicator color="#FFFFFF" />
                    <Text className="mt-2 text-sm font-semibold text-white">Reading card…</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View className="flex-1 items-center justify-center px-6">
                <CreditCard color="#7A7A7A" size={40} strokeWidth={1.6} />
                <Text className="mt-2 text-center text-sm text-textMuted dark:text-dark-textMuted">
                  Add a photo of their business card to fill in the details automatically
                </Text>
              </View>
            )}
          </View>

          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={card ? 'Rescan card' : 'Scan card'}
              disabled={capturing || saving}
              onPress={() => replaceCard('scan')}
              className="flex-1 flex-row items-center justify-center rounded-2xl bg-card py-3 dark:bg-dark-card"
            >
              <ScanLine color={Colors.light.tint} size={18} />
              <Text className="ml-2 font-semibold text-textPrimary dark:text-dark-textPrimary">{card ? 'Rescan' : 'Scan card'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Upload card photo"
              disabled={capturing || saving}
              onPress={() => replaceCard('library')}
              className="flex-1 flex-row items-center justify-center rounded-2xl bg-card py-3 dark:bg-dark-card"
            >
              <ImagePlus color={Colors.light.tint} size={18} />
              <Text className="ml-2 font-semibold text-textPrimary dark:text-dark-textPrimary">Upload photo</Text>
            </TouchableOpacity>
          </View>

          {readNotice ? (
            <View
              className={`mt-3 flex-row items-center rounded-2xl px-4 py-3 ${readNotice.tone === 'success' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}
            >
              {readNotice.tone === 'success' ? <Sparkles color="#059669" size={16} /> : <AlertCircle color="#D97706" size={16} />}
              <Text className="ml-2 flex-1 text-xs text-textPrimary dark:text-dark-textPrimary">{readNotice.text}</Text>
              {reader.status === 'failed' && card ? (
                <TouchableOpacity accessibilityRole="button" onPress={() => processCard(card.originalUri ? { ...card, uri: card.originalUri } : card)}>
                  <Text className="ml-2 text-xs font-bold text-primary dark:text-dark-primary">Retry</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <View className="mt-6">
            {FIELDS.map((field) => (
              <View key={field.key} className="mb-4">
                <View className="mb-1 ml-1 flex-row items-center">
                  <Text className="text-xs font-semibold uppercase text-textMuted dark:text-dark-textMuted">{field.label}</Text>
                  {autoFilled.includes(field.key) ? <Sparkles color="#059669" size={12} style={{ marginLeft: 6 }} /> : null}
                </View>
                <TextInput
                  value={form[field.key]}
                  onChangeText={(value) => setField(field.key, value)}
                  editable={!reading}
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.keyboardType === 'email-address' || field.keyboardType === 'url' ? 'none' : field.key === 'name' ? 'words' : 'sentences'}
                  autoCorrect={!field.keyboardType}
                  multiline={field.multiline}
                  numberOfLines={field.multiline ? 4 : undefined}
                  placeholder={field.label.replace(' *', '')}
                  placeholderTextColor="#7A7A7A"
                  className={`rounded-2xl border bg-black/5 px-4 py-3 text-textPrimary dark:bg-white/5 dark:text-dark-textPrimary ${errors[field.key] ? 'border-red-500' : 'border-black/5 dark:border-white/10'}`}
                  style={field.multiline ? { minHeight: 96, textAlignVertical: 'top' } : undefined}
                />
                {errors[field.key] ? <Text className="ml-1 mt-1 text-xs text-red-500">{errors[field.key]}</Text> : null}
              </View>
            ))}
          </View>

          <Button label="Save contact" icon={Check} loading={saving} disabled={capturing || reading || rotating} onPress={save} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
