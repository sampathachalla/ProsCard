import { useEffect, useState } from 'react';
import { Image, type ImageProps } from 'expo-image';
import {
  getDisplayMediaUrl,
  getImmediateDisplayMediaUrl,
  getMediaImageCacheKey,
} from '@/components/profileComponents/Services/mediaService';

type MediaImageProps = Omit<ImageProps, 'source'> & { sourceUrl: string };

export function MediaImage({ sourceUrl, ...props }: MediaImageProps) {
  const [resolved, setResolved] = useState(() => ({
    sourceUrl,
    displayUrl: getImmediateDisplayMediaUrl(sourceUrl),
  }));
  const cacheKey = getMediaImageCacheKey(sourceUrl);
  const displayUrl = resolved.sourceUrl === sourceUrl
    ? resolved.displayUrl
    : getImmediateDisplayMediaUrl(sourceUrl);

  useEffect(() => {
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
      source={displayUrl ? { uri: displayUrl, cacheKey } : undefined}
    />
  );
}
