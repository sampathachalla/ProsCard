import { useEffect, useState } from 'react';
import { Image, type ImageProps } from 'expo-image';
import {
  getDisplayMediaUrl,
  getImmediateDisplayMediaUrl,
  getMediaImageCacheKey,
} from '@/components/profileComponents/Services/mediaService';
import { resolveCoverPhotoPreset } from '@/components/cardsComponents/Services/coverPhotoPresets';

type MediaImageProps = Omit<ImageProps, 'source'> & { sourceUrl: string };

export function MediaImage({ sourceUrl, ...props }: MediaImageProps) {
  const coverPreset = resolveCoverPhotoPreset(sourceUrl);
  const [resolved, setResolved] = useState(() => ({
    sourceUrl,
    displayUrl: coverPreset ? '' : getImmediateDisplayMediaUrl(sourceUrl),
  }));
  const cacheKey = coverPreset ? coverPreset.value : getMediaImageCacheKey(sourceUrl);
  const displayUrl = resolved.sourceUrl === sourceUrl
    ? resolved.displayUrl
    : coverPreset ? '' : getImmediateDisplayMediaUrl(sourceUrl);

  useEffect(() => {
    if (resolveCoverPhotoPreset(sourceUrl)) return;
    let active = true;
    getDisplayMediaUrl(sourceUrl).then((url) => {
      if (active) setResolved({ sourceUrl, displayUrl: url });
    }).catch(() => {});
    return () => { active = false; };
  }, [sourceUrl]);

  return (
    <Image
      cachePolicy="memory-disk"
      transition={120}
      recyclingKey={cacheKey ?? sourceUrl}
      {...props}
      source={coverPreset?.source ?? (displayUrl ? { uri: displayUrl, cacheKey } : undefined)}
    />
  );
}
