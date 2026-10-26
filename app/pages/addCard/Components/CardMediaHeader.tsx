import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, ImagePlus, UserRound } from 'lucide-react-native';
import { CompanyLogoPickerModal } from '@/common/ui/CompanyLogoPickerModal';
import { MediaImage } from '@/common/ui/MediaImage';
import { Text } from '@/common/ui/Text';
import { pickImageFromLibrary } from '@/common/ui/usePickImage';
import { recordCommunityUploadedLogo } from '@/pages/cards/Services/companyLogoPresets';
import { IMAGE_ASPECTS, IMAGE_LABELS } from '../Config/addCardFields';
import { uploadCardImage } from '../Services/addCardService';
import type { AddCardImageField } from '../types/addCard.types';

type Props = {
  coverPhoto: string;
  profilePhoto: string;
  logo: string;
  gradient: [string, string];
  onChange: (field: AddCardImageField, value: string) => void;
};

/** Cover banner with the profile photo on the left and the logo on the right, each tappable. */
export function CardMediaHeader({ coverPhoto, profilePhoto, logo, gradient, onChange }: Props) {
  const [busyField, setBusyField] = useState<AddCardImageField | null>(null);
  const [logoModalVisible, setLogoModalVisible] = useState(false);

  const pick = async (field: AddCardImageField) => {
    setBusyField(field);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const uri = await pickImageFromLibrary({ aspect: IMAGE_ASPECTS[field], allowsEditing: true });
      if (!uri) return;
      const uploadedUrl = await uploadCardImage(uri, field);
      onChange(field, uploadedUrl);
      if (field === 'logo') {
        void recordCommunityUploadedLogo({ value: uploadedUrl, isOwn: true });
        setLogoModalVisible(false);
      }
    } catch (error) {
      Alert.alert(
        'Couldn’t upload image',
        error instanceof Error && error.message.trim() ? error.message : 'The image type or size is not allowed.',
      );
    } finally {
      setBusyField(null);
    }
  };

  const edit = (field: AddCardImageField, current: string) => {
    if (busyField) return;
    if (field === 'logo') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setLogoModalVisible(true);
      return;
    }
    if (!current.trim()) {
      void pick(field);
      return;
    }
    Alert.alert(IMAGE_LABELS[field], undefined, [
      { text: 'Replace', onPress: () => void pick(field) },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(field, '') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-card dark:border-slate-800 dark:bg-dark-card">
      <Pressable
        accessibilityLabel={coverPhoto ? 'Change cover photo' : 'Add cover photo'}
        accessibilityRole="button"
        onPress={() => edit('coverPhoto', coverPhoto)}
        className="h-36 w-full active:opacity-90"
      >
        {coverPhoto ? (
          <MediaImage sourceUrl={coverPhoto} contentFit="cover" style={{ width: '100%', height: '100%' }} />
        ) : (
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
        )}
        <View className="absolute inset-0 items-center justify-center">
          {busyField === 'coverPhoto' ? (
            <ActivityIndicator color="#ffffff" />
          ) : coverPhoto ? null : (
            <View className="flex-row items-center rounded-full bg-black/25 px-3 py-1.5">
              <ImagePlus color="#ffffff" size={16} strokeWidth={2.2} />
              <Text className="ml-1.5 text-sm font-semibold text-white">Cover</Text>
            </View>
          )}
        </View>
      </Pressable>

      <View className="-mt-10 flex-row items-end justify-between px-4 pb-3">
        <MediaSlot
          field="profilePhoto"
          label="Profile"
          value={profilePhoto}
          busy={busyField === 'profilePhoto'}
          round
          onPress={() => edit('profilePhoto', profilePhoto)}
        />
        <MediaSlot
          field="logo"
          label="Logo"
          value={logo}
          busy={busyField === 'logo'}
          onPress={() => edit('logo', logo)}
        />
      </View>

      <CompanyLogoPickerModal
        visible={logoModalVisible}
        value={logo}
        isUploading={busyField === 'logo'}
        onClose={() => setLogoModalVisible(false)}
        onSelectLogo={(logoValue) => onChange('logo', logoValue)}
        onUploadFromDevice={() => void pick('logo')}
        onRemoveLogo={logo.trim() ? () => onChange('logo', '') : undefined}
      />
    </View>
  );
}

function MediaSlot({
  field,
  label,
  value,
  busy,
  round = false,
  onPress,
}: {
  field: AddCardImageField;
  label: string;
  value: string;
  busy: boolean;
  round?: boolean;
  onPress: () => void;
}) {
  const Icon = field === 'logo' ? Building2 : UserRound;
  return (
    <Pressable
      accessibilityLabel={value ? `Change ${IMAGE_LABELS[field].toLowerCase()}` : `Add ${IMAGE_LABELS[field].toLowerCase()}`}
      accessibilityRole="button"
      onPress={onPress}
      className="items-center active:opacity-80"
    >
      <View
        className={`h-20 w-20 items-center justify-center overflow-hidden border-4 border-card bg-slate-100 dark:border-dark-card dark:bg-slate-800 ${
          round ? 'rounded-full' : 'rounded-2xl'
        }`}
      >
        {busy ? (
          <ActivityIndicator color="#2563eb" />
        ) : value ? (
          <MediaImage
            sourceUrl={value}
            contentFit={field === 'logo' ? 'contain' : 'cover'}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Icon color="#94a3b8" size={28} strokeWidth={1.8} />
        )}
      </View>
      <Text variant="tiny" className="mt-1">
        {label}
      </Text>
    </Pressable>
  );
}
