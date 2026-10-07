import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CardDetailSection } from '../Templates/cardDetailTemplate';
import {
  resolveIdentityTemplateId,
  type CardTemplateId,
  type CardVisualTheme,
  type IdentitySectionTemplateId,
} from '../types/card.types';
import { IdentityImage, UniversalLogoBadge } from '../Templates/sections/SectionSharedComponents';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { walletIdentityFields } from './walletPassFields';
import { WalletPassText } from './walletPassTypography';

export type WalletPassSectionProps = {
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
};

const AVATAR = 36;
const CLASSIC_AVATAR = 52;
const CLASSIC_TOP_HEIGHT = '60%' as const;
const imageColors = { iconColor: '#94a3b8', placeholderColor: '#e2e8f0' };

function WalletIdentityRoot({ children, backgroundColor }: { backgroundColor: string; children: React.ReactNode }) {
  return (
    <View className="h-full w-full overflow-hidden" style={{ backgroundColor, flex: 1 }}>
      {children}
    </View>
  );
}

function CoverBand({
  cover,
  height = '38%',
  logo,
  cardTheme,
  slots,
  templateId,
  dimOverlay = false,
}: {
  cover: ReturnType<typeof walletIdentityFields>['cover'];
  height?: number | `${number}%`;
  logo: ReturnType<typeof walletIdentityFields>['logo'];
  cardTheme: CardVisualTheme;
  slots: ReturnType<typeof resolveLayoutColorSlots>;
  templateId: CardTemplateId;
  dimOverlay?: boolean;
}) {
  return (
    <View className="relative w-full" style={{ height }}>
      <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: '100%' }} />
      {dimOverlay ? <View className="absolute inset-0 bg-black/20" /> : null}
      <View className="absolute left-2 top-2">
        <UniversalLogoBadge
          bare
          cardTheme={cardTheme}
          compact
          field={logo}
          placement="on-cover"
          slots={slots}
          templateId={templateId}
        />
      </View>
    </View>
  );
}

function ClassicIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: IdentitySectionTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <View className="relative h-full w-full">
        <View className="w-full overflow-hidden" style={{ height: CLASSIC_TOP_HEIGHT }}>
          <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
          <View className="absolute right-2 top-2">
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              compact
              field={logo}
              placement="on-cover"
              slots={slots}
              templateId={templateId}
            />
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-2.5" style={{ backgroundColor: slots.surface }}>
          <WalletPassText align="center" cardTheme={cardTheme} color={slots.textPrimary} lines={2} size="sm">
            {name}
          </WalletPassText>
        </View>
        <View className="absolute left-0 right-0 items-center" style={{ top: CLASSIC_TOP_HEIGHT, marginTop: -CLASSIC_AVATAR / 2 }}>
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: CLASSIC_AVATAR,
              height: CLASSIC_AVATAR,
              borderRadius: CLASSIC_AVATAR / 2,
              borderWidth: 2.5,
              borderColor: slots.accent,
            }}
          />
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function MinimalIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: IdentitySectionTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  const avatarSize = 44;
  const displayName = name ? name.replace(/\b\w/g, (c) => c.toUpperCase()) : name;
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <View className="h-full flex-row overflow-hidden">
        {/* Left: Cover & Elevated Profile Avatar */}
        <View
          className="w-1/2 items-center justify-center overflow-hidden"
          style={{
            backgroundColor: slots.background,
            borderRightWidth: StyleSheet.hairlineWidth,
            borderRightColor: slots.highlight || 'rgba(255,255,255,0.2)',
          }}
        >
          <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
          <View className="absolute inset-0 bg-black/25" />
          <View
            style={{
              padding: 2,
              borderRadius: (avatarSize + 4) / 2,
              backgroundColor: 'rgba(255,255,255,0.22)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.45)',
            }}
          >
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderWidth: 1.5, borderColor: '#ffffff' }}
            />
          </View>
        </View>

        {/* Right: Logo & Formatted Name */}
        <View className="w-1/2 justify-center px-2.5" style={{ backgroundColor: slots.surface }}>
          <UniversalLogoBadge bare cardTheme={cardTheme} compact field={logo} placement="on-surface" slots={slots} templateId={templateId} />
          <View className="mt-1">
            <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={2} size="md">
              {displayName}
            </WalletPassText>
          </View>
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function BoldIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: IdentitySectionTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.background}>
      <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.82)']} style={StyleSheet.absoluteFill} />
      <View className="absolute right-2 top-2">
        <UniversalLogoBadge bare cardTheme={cardTheme} compact field={logo} placement="on-cover" slots={slots} templateId={templateId} />
      </View>
      <View className="absolute bottom-0 left-0 right-0 flex-row items-end px-2.5 pb-2">
        <IdentityImage
          field={profile}
          {...imageColors}
          style={{ width: AVATAR, height: AVATAR, borderRadius: 10, borderWidth: 2, borderColor: slots.accent }}
        />
        <View className="ml-2 min-w-0 flex-1 pb-0.5">
          <WalletPassText cardTheme={cardTheme} color="#fff" lines={2} size="sm">
            {name}
          </WalletPassText>
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function EditorialIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: IdentitySectionTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <CoverBand cover={cover} height="32%" logo={logo} cardTheme={cardTheme} slots={slots} templateId={templateId} />
      <View className="flex-1 flex-row items-center border-t px-2.5" style={{ borderTopColor: slots.accent, borderTopWidth: 2 }}>
        <IdentityImage
          field={profile}
          {...imageColors}
          style={{ width: 32, height: 32, borderRadius: 4, borderWidth: 1.5, borderColor: slots.accent }}
        />
        <View className="ml-2 min-w-0 flex-1">
          <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={2} size="sm">
            {name}
          </WalletPassText>
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function SpotlightIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: IdentitySectionTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.background}>
      <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
      <View className="absolute inset-0 items-center justify-center bg-black/35">
        <View className="rounded-full p-0.5" style={{ backgroundColor: slots.accent }}>
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff' }}
          />
        </View>
        <View className="absolute left-2 top-2">
          <UniversalLogoBadge bare cardTheme={cardTheme} compact field={logo} placement="on-cover" slots={slots} templateId={templateId} />
        </View>
        <View className="absolute bottom-1.5 px-3">
          <WalletPassText align="center" cardTheme={cardTheme} color="#fff" lines={1} size="xs">
            {name}
          </WalletPassText>
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function SplitIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: IdentitySectionTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <View className="h-full flex-row">
        <View className="w-1/2 overflow-hidden" style={{ backgroundColor: slots.background }}>
          <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: '100%' }} />
        </View>
        <View className="w-1/2 justify-center px-2" style={{ backgroundColor: slots.surface }}>
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: slots.accent }}
          />
          <View className="mt-1.5">
            <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={3} size="xs">
              {name}
            </WalletPassText>
          </View>
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

const IDENTITY_WALLET: Record<IdentitySectionTemplateId, React.ComponentType<WalletPassSectionProps>> = {
  classic: (p) => <ClassicIdentity {...p} templateId="classic" />,
  minimal: (p) => <MinimalIdentity {...p} templateId="minimal" />,
  split: (p) => <SplitIdentity {...p} templateId="split" />,
  bold: (p) => <BoldIdentity {...p} templateId="bold" />,
  spotlight: (p) => <SpotlightIdentity {...p} templateId="spotlight" />,
  editorial: (p) => <EditorialIdentity {...p} templateId="editorial" />,
};

export function WalletIdentityPassRenderer(props: WalletPassSectionProps) {
  const templateId = resolveIdentityTemplateId(props.section.templateId);
  const Renderer = IDENTITY_WALLET[templateId];
  return <Renderer {...props} />;
}
