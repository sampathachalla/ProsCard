import type { ReactNode } from 'react';
import { View } from 'react-native';

type HomeScreenLayoutProps = {
  topInset: number;
  header: ReactNode;
  toolbar: ReactNode;
  preview: ReactNode;
};

/**
 * Paper wireframe structure:
 * top → logo + card tag + add
 * middle → edit + preview
 * bottom → preview card (flex)
 * (tab bar lives in app/(tabs)/_layout.tsx)
 */
export function HomeScreenLayout({ topInset, header, toolbar, preview }: HomeScreenLayoutProps) {
  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View style={{ paddingTop: topInset }}>
        {header}
        {toolbar}
      </View>
      <View className="flex-1 overflow-hidden pb-2.5">{preview}</View>
    </View>
  );
}
