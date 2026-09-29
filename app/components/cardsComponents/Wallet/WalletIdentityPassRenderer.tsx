import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CardDetailSection } from '../Templates/cardDetailTemplate';
import type { CardTemplateId, CardVisualTheme } from '../types/card.types';
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

/** Wallet section 1 — cover + dark identity row (reference wallet header). */
function WalletCoverIdentityBar({
  barColor,
  cardTheme,
  name,
  nameColor = '#ffffff',
  profile,
  slots,
}: {
  barColor: string;
  cardTheme: CardVisualTheme;
  name: string;
  nameColor?: string;
  profile: ReturnType<typeof walletIdentityFields>['profile'];
  slots: ReturnType<typeof resolveLayoutColorSlots>;
}) {
  return (
    <View
      className="flex-1 flex-row items-center px-2.5"
      style={{ backgroundColor: barColor }}
    >
      <IdentityImage
        field={profile}
        {...imageColors}
        style={{
          width: AVATAR,
          height: AVATAR,
          marginTop: -12,
          borderRadius: AVATAR / 2,
          borderWidth: 2,
          borderColor: slots.accent,
        }}
      />
      <View className="ml-2.5 min-w-0 flex-1">
        <WalletPassText cardTheme={cardTheme} color={nameColor} lines={2} size="sm">
          {name}
        </WalletPassText>
      </View>
    </View>
  );
}

function AvatarNameRow({
  name,
  cardTheme,
  profile,
  slots,
  textColor,
  overlap = -12,
  align = 'left',
}: {
  align?: 'left' | 'center';
  cardTheme: CardVisualTheme;
  name: string;
  overlap?: number;
  profile: ReturnType<typeof walletIdentityFields>['profile'];
  slots: ReturnType<typeof resolveLayoutColorSlots>;
  textColor: string;
}) {
  return (
    <View
      className={`flex-1 flex-row items-center px-2.5 ${align === 'center' ? 'justify-center' : ''}`}
      style={{ backgroundColor: slots.surface }}
    >
      <IdentityImage
        field={profile}
        {...imageColors}
        style={{
          width: AVATAR,
          height: AVATAR,
          marginTop: overlap,
          borderRadius: AVATAR / 2,
          borderWidth: 2,
          borderColor: slots.accent,
        }}
      />
      <View className={`min-w-0 flex-1 ${align === 'center' ? 'items-center' : 'ml-2'}`}>
        <WalletPassText align={align} cardTheme={cardTheme} color={textColor} lines={2} size="sm">
          {name}
        </WalletPassText>
      </View>
    </View>
  );
}

function ClassicIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  const identityBarColor = slots.isDark ? slots.background : '#0a1221';
  return (
    <WalletIdentityRoot backgroundColor={identityBarColor}>
      <CoverBand
        cover={cover}
        dimOverlay
        height="48%"
        logo={logo}
        cardTheme={cardTheme}
        slots={slots}
        templateId={templateId}
      />
      <WalletCoverIdentityBar
        barColor={identityBarColor}
        cardTheme={cardTheme}
        name={name}
        profile={profile}
        slots={slots}
      />
    </WalletIdentityRoot>
  );
}

function MinimalIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <View className="h-full flex-row overflow-hidden">
        <View className="w-[34%] items-center justify-center overflow-hidden" style={{ backgroundColor: slots.background }}>
          <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
          <View className="absolute inset-0 bg-black/25" />
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, borderWidth: 2, borderColor: slots.accent }}
          />
        </View>
        <View className="flex-1 justify-center px-2.5" style={{ backgroundColor: slots.surface }}>
          <UniversalLogoBadge cardTheme={cardTheme} compact field={logo} placement="on-surface" slots={slots} templateId={templateId} />
          <View className="mt-1">
            <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={2} size="sm">
              {name}
            </WalletPassText>
          </View>
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function BoldIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.background}>
      <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.82)']} style={StyleSheet.absoluteFill} />
      <View className="absolute right-2 top-2">
        <UniversalLogoBadge cardTheme={cardTheme} compact field={logo} placement="on-cover" slots={slots} templateId={templateId} />
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

function GlassIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.background}>
      <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
      <View className="flex-1 items-center justify-end px-2 pb-2">
        <View
          className="w-full flex-row items-center rounded-xl border px-2 py-1.5"
          style={{ backgroundColor: 'rgba(15,23,42,0.82)', borderColor: slots.highlight }}
        >
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: slots.accent }}
          />
          <View className="ml-2 min-w-0 flex-1">
            <WalletPassText cardTheme={cardTheme} color="#fff" lines={1} size="xs">
              {name}
            </WalletPassText>
          </View>
          <UniversalLogoBadge cardTheme={cardTheme} compact field={logo} placement="glass" slots={slots} templateId={templateId} />
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function CompactIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <View className="h-full flex-row items-center justify-between px-2.5" style={{ borderBottomWidth: 1, borderBottomColor: slots.highlight }}>
        <View className="min-w-0 flex-1 flex-row items-center">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 1.5, borderColor: slots.accent }}
          />
          <View className="ml-2 min-w-0 flex-1">
            <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="xs">
              {name}
            </WalletPassText>
          </View>
        </View>
        <UniversalLogoBadge cardTheme={cardTheme} compact field={logo} placement="on-surface" slots={slots} templateId={templateId} />
      </View>
    </WalletIdentityRoot>
  );
}

function EditorialIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
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

function SpotlightIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
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
          <UniversalLogoBadge cardTheme={cardTheme} compact field={logo} placement="on-cover" slots={slots} templateId={templateId} />
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

function BannerIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <View className="px-2 py-1" style={{ backgroundColor: slots.accent }}>
        <WalletPassText align="center" cardTheme={cardTheme} color="#fff" lines={1} size="xs" weight="bold">
          {name}
        </WalletPassText>
      </View>
      <CoverBand cover={cover} height="42%" logo={logo} cardTheme={cardTheme} slots={slots} templateId={templateId} />
      <View className="flex-1 flex-row items-center px-2">
        <IdentityImage
          field={profile}
          {...imageColors}
          style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: slots.accent }}
        />
        <View className="ml-2">
          <UniversalLogoBadge cardTheme={cardTheme} compact field={logo} placement="on-surface" slots={slots} templateId={templateId} />
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function CardsIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.background}>
      <View className="flex-1 p-2">
        <View className="flex-1 overflow-hidden rounded-xl border" style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
          <CoverBand cover={cover} height="45%" logo={logo} cardTheme={cardTheme} slots={slots} templateId={templateId} />
          <AvatarNameRow
            cardTheme={cardTheme}
            name={name}
            overlap={0}
            profile={profile}
            slots={slots}
            textColor={slots.textPrimary}
          />
        </View>
      </View>
    </WalletIdentityRoot>
  );
}

function BadgeIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.surface}>
      <View className="h-full flex-row items-center border px-2" style={{ borderColor: slots.accent }}>
        <IdentityImage
          field={profile}
          {...imageColors}
          style={{ width: 38, height: 46, borderRadius: 4, borderWidth: 1, borderColor: slots.highlight }}
        />
        <View className="ml-2 min-w-0 flex-1">
          <WalletPassText cardTheme={cardTheme} color={slots.textSecondary} lines={1} size="xs" weight="bold">
            IDENTITY
          </WalletPassText>
          <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={2} size="sm">
            {name}
          </WalletPassText>
        </View>
        <UniversalLogoBadge cardTheme={cardTheme} compact field={logo} placement="on-surface" slots={slots} templateId={templateId} />
      </View>
    </WalletIdentityRoot>
  );
}

function SplitIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
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

function NeonIdentity({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { cover, logo, name, profile } = walletIdentityFields(section);
  return (
    <WalletIdentityRoot backgroundColor={slots.background}>
      <View className="m-1.5 flex-1 overflow-hidden rounded-lg border-2" style={{ borderColor: slots.accent }}>
        <CoverBand cover={cover} height="42%" logo={logo} cardTheme={cardTheme} slots={slots} templateId={templateId} />
        <AvatarNameRow cardTheme={cardTheme} name={name} profile={profile} slots={slots} textColor={slots.textPrimary} overlap={0} />
      </View>
    </WalletIdentityRoot>
  );
}

const IDENTITY_WALLET: Record<CardTemplateId, React.ComponentType<WalletPassSectionProps>> = {
  classic: (p) => <ClassicIdentity {...p} templateId="classic" />,
  minimal: (p) => <MinimalIdentity {...p} templateId="minimal" />,
  bold: (p) => <BoldIdentity {...p} templateId="bold" />,
  glass: (p) => <GlassIdentity {...p} templateId="glass" />,
  compact: (p) => <CompactIdentity {...p} templateId="compact" />,
  editorial: (p) => <EditorialIdentity {...p} templateId="editorial" />,
  spotlight: (p) => <SpotlightIdentity {...p} templateId="spotlight" />,
  banner: (p) => <BannerIdentity {...p} templateId="banner" />,
  cards: (p) => <CardsIdentity {...p} templateId="cards" />,
  badge: (p) => <BadgeIdentity {...p} templateId="badge" />,
  split: (p) => <SplitIdentity {...p} templateId="split" />,
  neon: (p) => <NeonIdentity {...p} templateId="neon" />,
};

export function WalletIdentityPassRenderer(props: WalletPassSectionProps) {
  const Renderer = IDENTITY_WALLET[props.section.templateId] ?? IDENTITY_WALLET.classic;
  return <Renderer {...props} />;
}
