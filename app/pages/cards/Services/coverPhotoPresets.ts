export const COVER_PHOTO_PRESET_PREFIX = 'proscard-cover:';

export type CoverPhotoPreset = {
  id: string;
  label: string;
  value: string;
  source: number;
};

function preset(id: string, label: string, source: number): CoverPhotoPreset {
  return { id, label, source, value: `${COVER_PHOTO_PRESET_PREFIX}${id}` };
}

/** Bundled, crop-safe covers that remain valid when a card is opened on another device. */
export const COVER_PHOTO_PRESETS: CoverPhotoPreset[] = [
  preset('ocean-glass', 'Ocean Glass', require('@/assets/card-covers/ocean-glass.jpg')),
  preset('midnight-architecture', 'Midnight', require('@/assets/card-covers/midnight-architecture.jpg')),
  preset('emerald-contours', 'Emerald', require('@/assets/card-covers/emerald-contours.jpg')),
  preset('amber-horizon', 'Amber', require('@/assets/card-covers/amber-horizon.jpg')),
];

export function resolveCoverPhotoPreset(value: string): CoverPhotoPreset | undefined {
  if (!value.startsWith(COVER_PHOTO_PRESET_PREFIX)) return undefined;
  return COVER_PHOTO_PRESETS.find((item) => item.value === value);
}
