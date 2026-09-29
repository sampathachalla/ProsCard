import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CardTemplateId } from '../types/card.types';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { walletProfessionalFields } from './walletPassFields';
import {
  WalletPassAccentRule,
  WalletPassNameBlock,
  WalletPassRoleBlock,
  WalletPassText,
} from './walletPassTypography';
import type { WalletPassSectionProps } from './WalletIdentityPassRenderer';

function gradientSlots(slots: ReturnType<typeof resolveLayoutColorSlots>) {
  return {
    ...slots,
    textPrimary: slots.gradientText ?? slots.textPrimary,
    textSecondary: slots.isDark ? '#e2e8f0' : '#475569',
  };
}

function WalletProRoot({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View className="h-full w-full overflow-hidden" style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );
}

function ClassicProfessional({ section, cardTheme, gradient, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 }}>
        <WalletPassNameBlock accreditations={accreditations} align="center" cardTheme={cardTheme} name={professionalName} slots={slots} />
        <WalletPassAccentRule align="center" color={slots.accent} width={36} />
        <WalletPassRoleBlock align="center" cardTheme={cardTheme} company={company} slots={slots} title={title} />
      </LinearGradient>
    </WalletProRoot>
  );
}

function MinimalProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface, borderLeftWidth: 4, borderLeftColor: slots.accent }}>
      <View className="flex-1 justify-center px-3 py-2">
        <WalletPassNameBlock accreditations={accreditations} cardTheme={cardTheme} name={professionalName} slots={slots} />
        <WalletPassAccentRule align="left" color={slots.accent} width={28} />
        <WalletPassRoleBlock cardTheme={cardTheme} company={company} slots={slots} title={title} />
      </View>
    </WalletProRoot>
  );
}

function BoldProfessional({ section, cardTheme, gradient, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
        <View className="w-full items-center">
          <WalletPassNameBlock accreditations={accreditations} align="center" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassRoleBlock align="center" cardTheme={cardTheme} company={company} slots={slots} title={title} />
        </View>
      </LinearGradient>
    </WalletProRoot>
  );
}

function GlassProfessional({ section, cardTheme, gradient, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, justifyContent: 'center', padding: 8 }}>
        <View
          className="rounded-xl border px-2.5 py-2"
          style={{ backgroundColor: 'rgba(15,23,42,0.55)', borderColor: slots.highlight }}
        >
          <WalletPassNameBlock accreditations={accreditations} align="center" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassRoleBlock align="center" cardTheme={cardTheme} company={company} slots={slots} title={title} />
        </View>
      </LinearGradient>
    </WalletProRoot>
  );
}

function CompactProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="flex-1 flex-row items-center justify-between px-3">
        <View className="min-w-0 flex-1">
          <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="xs">
            {professionalName}
          </WalletPassText>
          <WalletPassText cardTheme={cardTheme} color={slots.accent} lines={1} size="xs" weight="bold">
            {`${title} · ${company}`}
          </WalletPassText>
        </View>
      </View>
    </WalletProRoot>
  );
}

function EditorialProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="flex-1 justify-center px-3 py-2">
        <WalletPassNameBlock accreditations={accreditations} cardTheme={cardTheme} name={professionalName} slots={slots} />
        <View className="my-1 h-px w-full" style={{ backgroundColor: slots.accent }} />
        <WalletPassRoleBlock cardTheme={cardTheme} company={company} slots={slots} title={title} />
      </View>
    </WalletProRoot>
  );
}

function SpotlightProfessional({ section, cardTheme, gradient, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 8 }}>
        <WalletPassNameBlock accreditations={accreditations} align="center" cardTheme={cardTheme} name={professionalName} slots={slots} />
        <View className="my-1 rounded-full px-3 py-0.5" style={{ backgroundColor: `${slots.accent}33`, borderWidth: 1, borderColor: slots.accent }}>
          <WalletPassText align="center" cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="xs" weight="bold">
            {title}
          </WalletPassText>
        </View>
        <WalletPassText align="center" cardTheme={cardTheme} color={slots.textSecondary} lines={1} size="xs" weight="semibold">
          {company}
        </WalletPassText>
      </LinearGradient>
    </WalletProRoot>
  );
}

function BannerProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="flex-row items-center justify-between px-2 py-1" style={{ backgroundColor: slots.accent }}>
        <WalletPassText cardTheme={cardTheme} color="#fff" lines={1} size="xs" weight="bold">
          {company}
        </WalletPassText>
      </View>
      <View className="flex-1 justify-center px-3 py-1.5">
        <WalletPassNameBlock accreditations={accreditations} cardTheme={cardTheme} name={professionalName} slots={slots} />
        <WalletPassText cardTheme={cardTheme} color={slots.accent} lines={1} size="xs" weight="bold">
          {title}
        </WalletPassText>
      </View>
    </WalletProRoot>
  );
}

function CardsProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.background, padding: 6 }}>
      <View className="flex-1 gap-1">
        <View className="flex-1 justify-center rounded-lg border px-2 py-1" style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
          <WalletPassNameBlock accreditations={accreditations} cardTheme={cardTheme} name={professionalName} slots={slots} />
        </View>
        <View className="flex-1 justify-center rounded-lg border px-2 py-1" style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
          <WalletPassRoleBlock cardTheme={cardTheme} company={company} slots={slots} title={title} />
        </View>
      </View>
    </WalletProRoot>
  );
}

function BadgeProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface, borderWidth: 1, borderColor: slots.accent }}>
      <View className="flex-row items-center justify-between border-b px-2 py-1" style={{ borderBottomColor: slots.highlight }}>
        <WalletPassText cardTheme={cardTheme} color={slots.accent} lines={1} size="xs" weight="bold">
          CREDENTIAL
        </WalletPassText>
        <WalletPassText cardTheme={cardTheme} color={slots.textSecondary} lines={1} size="xs">
          {company}
        </WalletPassText>
      </View>
      <View className="flex-1 justify-center px-2 py-1">
        <WalletPassNameBlock accreditations={accreditations} cardTheme={cardTheme} name={professionalName} slots={slots} />
        <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="xs" weight="bold">
          {title}
        </WalletPassText>
      </View>
    </WalletProRoot>
  );
}

function SplitProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="h-full flex-row">
        <View className="w-1/2 justify-center border-r px-2 py-1" style={{ borderRightColor: slots.highlight, backgroundColor: slots.background }}>
          <WalletPassNameBlock cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassText cardTheme={cardTheme} color={slots.accent} lines={1} size="xs" weight="bold">
            {title}
          </WalletPassText>
        </View>
        <View className="w-1/2 justify-center px-2 py-1">
          <WalletPassText cardTheme={cardTheme} color={slots.textSecondary} lines={2} size="xs" weight="semibold">
            {company}
          </WalletPassText>
        </View>
      </View>
    </WalletProRoot>
  );
}

function NeonProfessional({ section, cardTheme, templateId }: WalletPassSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.background, padding: 6 }}>
      <View className="flex-1 justify-center rounded-lg border-2 px-2 py-1.5" style={{ borderColor: slots.accent }}>
        <WalletPassNameBlock accreditations={accreditations} cardTheme={cardTheme} name={professionalName} slots={slots} />
        <WalletPassAccentRule align="left" color={slots.accent} width={32} />
        <WalletPassRoleBlock cardTheme={cardTheme} company={company} slots={slots} title={title} />
      </View>
    </WalletProRoot>
  );
}

const PROFESSIONAL_WALLET: Record<CardTemplateId, React.ComponentType<WalletPassSectionProps>> = {
  classic: (p) => <ClassicProfessional {...p} templateId="classic" />,
  minimal: (p) => <MinimalProfessional {...p} templateId="minimal" />,
  bold: (p) => <BoldProfessional {...p} templateId="bold" />,
  glass: (p) => <GlassProfessional {...p} templateId="glass" />,
  compact: (p) => <CompactProfessional {...p} templateId="compact" />,
  editorial: (p) => <EditorialProfessional {...p} templateId="editorial" />,
  spotlight: (p) => <SpotlightProfessional {...p} templateId="spotlight" />,
  banner: (p) => <BannerProfessional {...p} templateId="banner" />,
  cards: (p) => <CardsProfessional {...p} templateId="cards" />,
  badge: (p) => <BadgeProfessional {...p} templateId="badge" />,
  split: (p) => <SplitProfessional {...p} templateId="split" />,
  neon: (p) => <NeonProfessional {...p} templateId="neon" />,
};

export function WalletProfessionalPassRenderer(props: WalletPassSectionProps) {
  const Renderer = PROFESSIONAL_WALLET[props.section.templateId] ?? PROFESSIONAL_WALLET.classic;
  return <Renderer {...props} />;
}
