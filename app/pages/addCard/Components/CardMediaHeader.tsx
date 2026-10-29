import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, ImagePlus, UserRound } from 'lucide-react-native';
import { CardMediaPickerModal } from '@/common/ui/CardMediaPickerModal';
import { CompanyLogoPickerModal } from '@/common/ui/CompanyLogoPickerModal';
import { MediaImage } from '@/common/ui/MediaImage';
import { Text } from '@/common/ui/Text';
import { PhotoAdjustmentModal } from '@/common/ui/PhotoAdjustmentModal';
import { pickImageAssetFromLibrary, takePhotoAsset, type PickedImage } from '@/common/ui/usePickImage';
import { recordCommunityUploadedLogo } from '@/pages/cards/Services/companyLogoPresets';
import type { CardVisualTheme } from '@/pages/cards/types/card.types';
import { extractLogoPalette } from '@/pages/profile/Services/mediaService';
import type { LogoPalette } from '@/services/api/types';
import type { MediaScope } from '@/services/api/types';
import { buildThemeFromLogoPalette } from '@/utils/cardThemeColor';
import { IMAGE_ASPECTS, IMAGE_LABELS } from '../Config/addCardFields';
import { uploadCardImage } from '../Services/addCardService';
import type { AddCardImageField } from '../types/addCard.types';

type Props = {
  coverPhoto: string;
  profilePhoto: string;
  logo: string;
  logoBackdrop: string;
  gradient: [string, string];
  onChange: (field: AddCardImageField, value: string) => void;
  onAutoThemeFromLogo?: (theme: CardVisualTheme) => void;
  onPaletteExtracted?: (palette: LogoPalette) => void;
  uploadScope?: MediaScope;
  uploadCardId?: string;
};

/** Cover banner with the profile photo on the left and the logo on the right, each tappable. */
export function CardMediaHeader({ coverPhoto, profilePhoto, logo, logoBackdrop, gradient, onChange, onAutoThemeFromLogo, onPaletteExtracted, uploadScope = 'profile', uploadCardId }: Props) {
  const [busyField, setBusyField] = useState<AddCardImageField | null>(null);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [mediaPickerField, setMediaPickerField] = useState<'coverPhoto' | 'profilePhoto' | null>(null);
  const [pendingAsset, setPendingAsset] = useState<PickedImage | null>(null);
  const [pendingField, setPendingField] = useState<AddCardImageField | null>(null);

  const pick = async (field: AddCardImageField, source: 'camera' | 'library') => {
    setBusyField(field);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const asset = source === 'camera'
        ? await takePhotoAsset()
        : await pickImageAssetFromLibrary({ allowsEditing: false });
      if (!asset) {
        setBusyField(null);
        return;
      }
      setPendingField(field);
      setPendingAsset(asset);
    } catch (error) {
      setBusyField(null);
      Alert.alert('Couldn’t open photo', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const uploadAdjusted = async (uri: string) => {
    if (!pendingField) return;
    const field = pendingField;
    setPendingAsset(null);
    try {
      const uploadedUrl = await uploadCardImage(uri, field, {
        scope: uploadScope,
        cardId: uploadScope === 'card' ? uploadCardId : undefined,
      });
      onChange(field, uploadedUrl);
      if (field === 'logo') {
        void recordCommunityUploadedLogo({ value: uploadedUrl, isOwn: true });
        setLogoModalVisible(false);
        try {
          const palette = await extractLogoPalette({ imageUrl: uploadedUrl });
          if (onPaletteExtracted) {
            onPaletteExtracted(palette);
          } else {
            const brandTheme = buildThemeFromLogoPalette(palette);
            onAutoThemeFromLogo?.(brandTheme);
          }
        } catch {
          // If auto-theming cannot extract palette, retain current theme
        }
      }
    } catch (error) {
      Alert.alert(
        'Couldn’t upload image',
        error instanceof Error && error.message.trim() ? error.message : 'The image type or size is not allowed.',
      );
    } finally {
      setBusyField(null);
      setPendingField(null);
    }
  };

  const openPicker = (field: 'coverPhoto' | 'profilePhoto') => {
    if (busyField) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setMediaPickerField(field);
  };

  const openLogoPicker = () => {
    if (busyField) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLogoModalVisible(true);
  };

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-card dark:border-slate-800 dark:bg-dark-card">
      <Pressable
        accessibilityLabel={coverPhoto ? 'Change cover photo' : 'Add cover photo'}
        accessibilityRole="button"
        onPress={() => openPicker('coverPhoto')}
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
          onPress={() => openPicker('profilePhoto')}
        />
        <MediaSlot
          field="logo"
          label="Logo"
          value={logo}
          backdropColor={logoBackdrop}
          busy={busyField === 'logo'}
          onPress={openLogoPicker}
        />
      </View>

      <CardMediaPickerModal
        visible={mediaPickerField !== null}
        field={mediaPickerField ?? 'coverPhoto'}
        currentValue={mediaPickerField === 'coverPhoto' ? coverPhoto : profilePhoto}
        onClose={() => setMediaPickerField(null)}
        onSelectMedia={(url) => {
          if (mediaPickerField) {
            onChange(mediaPickerField, url);
          }
        }}
        onTakePhoto={() => {
          if (mediaPickerField) {
            void pick(mediaPickerField, 'camera');
          }
        }}
        onPickFromDeviceLibrary={() => {
          if (mediaPickerField) {
            void pick(mediaPickerField, 'library');
          }
        }}
        onRemove={() => {
          if (mediaPickerField) {
            onChange(mediaPickerField, '');
          }
        }}
      />

      <CompanyLogoPickerModal
        visible={logoModalVisible}
        value={logo}
        isUploading={busyField === 'logo'}
        onClose={() => setLogoModalVisible(false)}
        onSelectLogo={async (logoValue) => {
          onChange('logo', logoValue);
          setLogoModalVisible(false);
          if (logoValue.trim()) {
            try {
              const palette = await extractLogoPalette({ imageUrl: logoValue });
              if (onPaletteExtracted) {
                onPaletteExtracted(palette);
              } else {
                const brandTheme = buildThemeFromLogoPalette(palette);
                onAutoThemeFromLogo?.(brandTheme);
              }
            } catch {
              // Retain current theme on error
            }
          }
        }}
        onUploadFromDevice={() => {
          void pick('logo', 'library');
        }}
        onRemoveLogo={logo.trim() ? () => onChange('logo', '') : undefined}
      />
      <PhotoAdjustmentModal
        asset={pendingAsset}
        aspect={pendingField ? IMAGE_ASPECTS[pendingField] : [1, 1]}
        title={`Adjust ${pendingField ? IMAGE_LABELS[pendingField] : 'photo'}`}
        onCancel={() => { setPendingAsset(null); setPendingField(null); setBusyField(null); }}
        onSave={uploadAdjusted}
      />
    </View>
  );
}

function MediaSlot({
  field,
  label,
  value,
  busy,
  backdropColor,
  round = false,
  onPress,
}: {
  field: AddCardImageField;
  label: string;
  value: string;
  busy: boolean;
  backdropColor?: string;
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
        className={`h-20 w-20 items-center justify-center overflow-hidden border-4 border-card dark:border-dark-card ${
          round ? 'rounded-full' : 'rounded-2xl'
        }`}
        style={{ backgroundColor: field === 'logo' ? backdropColor || '#f8fafc' : '#f1f5f9' }}
      >
        {busy ? (
          <ActivityIndicator color="#2563eb" />
        ) : value ? (
          <MediaImage
            sourceUrl={value}
            contentFit={field === 'logo' ? 'contain' : 'cover'}
            style={{
              width: field === 'logo' ? '86%' : '100%',
              height: field === 'logo' ? '86%' : '100%',
            }}
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
