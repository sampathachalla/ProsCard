import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

export interface SharePageLayoutProps {
  topInset: number;
  bottomInset: number;
  header: ReactNode;
  qrHero: ReactNode;
  actionsList: ReactNode;
  footer?: ReactNode;
}

/**
 * Paper wireframe structure for Share Page:
 * 1. Top Header + Active Card selector
 * 2. Centered QR Hero Card box ("QR")
 * 3. Full-width vertical list of 13 share action rows
 */
export function SharePageLayout({
  topInset,
  bottomInset,
  header,
  qrHero,
  actionsList,
  footer,
}: SharePageLayoutProps) {
  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: topInset,
          paddingBottom: bottomInset + 24,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[440px] self-center">
          {header}
          <View className="mt-4">{qrHero}</View>
          <View className="mt-5">{actionsList}</View>
          {footer ? <View className="mt-4">{footer}</View> : null}
        </View>
      </ScrollView>
    </View>
  );
}
