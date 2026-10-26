import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Image, type ImageProps } from 'expo-image';
import {
  getDisplayMediaUrl,
  getImmediateDisplayMediaUrl,
  getMediaImageCacheKey,
} from '@/pages/profile/Services/mediaService';
import { resolveCoverPhotoPreset } from '@/pages/cards/Services/coverPhotoPresets';
import { resolveCompanyLogoPreset } from '@/pages/cards/Services/companyLogoPresets';

type MediaImageProps = Omit<ImageProps, 'source'> & { sourceUrl: string };

export function MediaImage({ sourceUrl, ...props }: MediaImageProps) {
  const bundledPreset =
    resolveCoverPhotoPreset(sourceUrl) ?? resolveCompanyLogoPreset(sourceUrl);
  const [resolved, setResolved] = useState(() => ({
    sourceUrl,
    displayUrl: bundledPreset ? '' : getImmediateDisplayMediaUrl(sourceUrl),
  }));
  const cacheKey = bundledPreset ? bundledPreset.value : getMediaImageCacheKey(sourceUrl);
  const displayUrl = resolved.sourceUrl === sourceUrl
    ? resolved.displayUrl
    : bundledPreset ? '' : getImmediateDisplayMediaUrl(sourceUrl);

  useEffect(() => {
    if (resolveCoverPhotoPreset(sourceUrl) || resolveCompanyLogoPreset(sourceUrl)) return;
    let active = true;
    getDisplayMediaUrl(sourceUrl).then((url) => {
      if (active) setResolved({ sourceUrl, displayUrl: url });
    }).catch(() => {});
    return () => { active = false; };
  }, [sourceUrl]);

  return (
    <Image
      cachePolicy="memory-disk"
      transition={Platform.OS === 'web' ? 0 : 120}
      recyclingKey={cacheKey ?? sourceUrl}
      {...props}
      source={bundledPreset?.source ?? (displayUrl ? { uri: displayUrl, cacheKey } : undefined)}
    />
  );
}
