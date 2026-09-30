import { useEffect, useState } from 'react';
import { Image, type ImageProps } from 'expo-image';
import { getDisplayMediaUrl } from '@/components/profileComponents/Services/mediaService';

type MediaImageProps = Omit<ImageProps, 'source'> & { sourceUrl: string };

export function MediaImage({ sourceUrl, ...props }: MediaImageProps) {
  const [displayUrl, setDisplayUrl] = useState(sourceUrl);
  useEffect(() => {
    let active = true;
    getDisplayMediaUrl(sourceUrl).then((url) => { if (active) setDisplayUrl(url); }).catch(() => {});
    return () => { active = false; };
  }, [sourceUrl]);
  return <Image {...props} source={{ uri: displayUrl }} />;
}
