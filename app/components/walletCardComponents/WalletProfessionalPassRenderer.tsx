import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CardDetailSection } from '@/components/cardsComponents/Templates/cardDetailTemplate';
import type { CardTemplateId, CardVisualTheme } from '@/components/cardsComponents/types/card.types';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { walletProfessionalFields } from './walletPassFields';
import {
  WalletPassAccentRule,
  WalletPassNameBlock,
  WalletPassRoleBlock,
  WalletPassText,
} from './walletPassTypography';
import { WalletQRCodeView } from './WalletQRCodeView';

export type WalletProfessionalSectionProps = {
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  qrValue: string;
  height?: number;
};

const QR_SIZE = 66;

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

function ClassicProfessional({ section, cardTheme, gradient, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <View className="flex-1 pr-3 justify-center">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassAccentRule align="left" color={slots.accent} width={32} />
          <WalletPassRoleBlock align="left" cardTheme={cardTheme} company={company} slots={slots} title={title} />
        </View>
        <WalletQRCodeView size={QR_SIZE} value={qrValue} borderColor={slots.highlight} />
      </LinearGradient>
    </WalletProRoot>
  );
}

function MinimalProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface, borderLeftWidth: 4, borderLeftColor: slots.accent }}>
      <View className="flex-1 flex-row items-center justify-between px-4 py-2">
        <View className="flex-1 pr-3 justify-center">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassAccentRule align="left" color={slots.accent} width={28} />
          <WalletPassRoleBlock align="left" cardTheme={cardTheme} company={company} slots={slots} title={title} />
        </View>
        <WalletQRCodeView size={QR_SIZE} value={qrValue} borderColor={slots.accent} />
      </View>
    </WalletProRoot>
  );
}

function BoldProfessional({ section, cardTheme, gradient, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <View className="flex-1 pr-3 justify-center">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <View className="mt-1">
            <WalletPassRoleBlock align="left" cardTheme={cardTheme} company={company} slots={slots} title={title} />
          </View>
        </View>
        <WalletQRCodeView size={QR_SIZE} value={qrValue} containerColor="#ffffff" borderColor="rgba(255,255,255,0.4)" />
      </LinearGradient>
    </WalletProRoot>
  );
}

function GlassProfessional({ section, cardTheme, gradient, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, padding: 8 }}>
        <View
          className="flex-1 flex-row items-center justify-between rounded-xl border px-3.5 py-1.5"
          style={{ backgroundColor: 'rgba(15,23,42,0.7)', borderColor: slots.highlight }}
        >
          <View className="flex-1 pr-3 justify-center">
            <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
            <WalletPassRoleBlock align="left" cardTheme={cardTheme} company={company} slots={slots} title={title} />
          </View>
          <WalletQRCodeView size={60} value={qrValue} borderColor={slots.highlight} />
        </View>
      </LinearGradient>
    </WalletProRoot>
  );
}

function CompactProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="flex-1 flex-row items-center justify-between px-4 py-2">
        <View className="min-w-0 flex-1 pr-2.5 justify-center">
          <WalletPassText cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="md" weight="bold">
            {professionalName}
          </WalletPassText>
          <WalletPassText cardTheme={cardTheme} color={slots.accent} lines={1} size="sm" weight="black">
            {title}
          </WalletPassText>
          <WalletPassText cardTheme={cardTheme} color={slots.textSecondary} lines={1} size="sm" weight="semibold">
            {company}
          </WalletPassText>
        </View>
        <WalletQRCodeView size={60} value={qrValue} borderColor={slots.highlight} />
      </View>
    </WalletProRoot>
  );
}

function EditorialProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="flex-1 flex-row items-center justify-between px-4 py-2">
        <View className="flex-1 pr-3 justify-center">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <View className="my-1 h-px w-full" style={{ backgroundColor: slots.accent }} />
          <WalletPassRoleBlock align="left" cardTheme={cardTheme} company={company} slots={slots} title={title} />
        </View>
        <WalletQRCodeView size={QR_SIZE} value={qrValue} borderColor={slots.accent} />
      </View>
    </WalletProRoot>
  );
}

function SpotlightProfessional({ section, cardTheme, gradient, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = gradientSlots(resolveLayoutColorSlots({ templateId, theme: cardTheme }));
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot>
      <LinearGradient colors={gradient} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 6 }}>
        <View className="flex-1 pr-2.5 justify-center items-start">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <View className="my-1 rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${slots.accent}33`, borderWidth: 1, borderColor: slots.accent }}>
            <WalletPassText align="left" cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="sm" weight="black">
              {title}
            </WalletPassText>
          </View>
          <WalletPassText align="left" cardTheme={cardTheme} color={slots.textSecondary} lines={1} size="sm" weight="semibold">
            {company}
          </WalletPassText>
        </View>
        <WalletQRCodeView size={60} value={qrValue} borderColor={slots.accent} />
      </LinearGradient>
    </WalletProRoot>
  );
}

function BannerProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="flex-row items-center justify-between px-3.5 py-1" style={{ backgroundColor: slots.accent }}>
        <WalletPassText cardTheme={cardTheme} color="#fff" lines={1} size="xs" weight="black">
          {company}
        </WalletPassText>
      </View>
      <View className="flex-1 flex-row items-center justify-between px-3.5 py-1.5">
        <View className="flex-1 pr-2.5 justify-center">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassText align="left" cardTheme={cardTheme} color={slots.accent} lines={1} size="md" weight="black">
            {title}
          </WalletPassText>
        </View>
        <WalletQRCodeView size={58} value={qrValue} borderColor={slots.accent} />
      </View>
    </WalletProRoot>
  );
}

function CardsProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.background, padding: 6 }}>
      <View className="flex-1 flex-row items-center gap-2">
        <View className="flex-1 justify-center rounded-xl border px-3 py-1.5" style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <View className="mt-1">
            <WalletPassRoleBlock align="left" cardTheme={cardTheme} company={company} slots={slots} title={title} />
          </View>
        </View>
        <WalletQRCodeView size={58} value={qrValue} borderColor={slots.highlight} />
      </View>
    </WalletProRoot>
  );
}

function BadgeProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface, borderWidth: 1, borderColor: slots.accent }}>
      <View className="flex-row items-center justify-between border-b px-3 py-1" style={{ borderBottomColor: slots.highlight }}>
        <WalletPassText cardTheme={cardTheme} color={slots.accent} lines={1} size="xs" weight="black">
          CREDENTIAL
        </WalletPassText>
        <WalletPassText cardTheme={cardTheme} color={slots.textSecondary} lines={1} size="xs" weight="semibold">
          {company}
        </WalletPassText>
      </View>
      <View className="flex-1 flex-row items-center justify-between px-3 py-1.5">
        <View className="flex-1 pr-2.5 justify-center">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassText align="left" cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="md" weight="black">
            {title}
          </WalletPassText>
        </View>
        <WalletQRCodeView size={56} value={qrValue} borderColor={slots.accent} />
      </View>
    </WalletProRoot>
  );
}

function SplitProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.surface }}>
      <View className="h-full flex-row">
        <View className="flex-1 justify-center border-r px-3 py-1.5" style={{ borderRightColor: slots.highlight, backgroundColor: slots.background }}>
          <WalletPassNameBlock align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassText align="left" cardTheme={cardTheme} color={slots.accent} lines={1} size="md" weight="black">
            {title}
          </WalletPassText>
          <WalletPassText align="left" cardTheme={cardTheme} color={slots.textSecondary} lines={1} size="sm" weight="semibold">
            {company}
          </WalletPassText>
        </View>
        <View className="w-[88px] items-center justify-center p-1.5">
          <WalletQRCodeView size={58} value={qrValue} borderColor={slots.highlight} />
        </View>
      </View>
    </WalletProRoot>
  );
}

function NeonProfessional({ section, cardTheme, qrValue, templateId }: WalletProfessionalSectionProps & { templateId: CardTemplateId }) {
  const slots = resolveLayoutColorSlots({ templateId, theme: cardTheme });
  const { accreditations, company, professionalName, title } = walletProfessionalFields(section);
  return (
    <WalletProRoot style={{ backgroundColor: slots.background, padding: 6 }}>
      <View className="flex-1 flex-row items-center justify-between rounded-xl border-2 px-3 py-1.5" style={{ borderColor: slots.accent }}>
        <View className="flex-1 pr-2.5 justify-center">
          <WalletPassNameBlock accreditations={accreditations} align="left" cardTheme={cardTheme} name={professionalName} slots={slots} />
          <WalletPassAccentRule align="left" color={slots.accent} width={28} />
          <WalletPassRoleBlock align="left" cardTheme={cardTheme} company={company} slots={slots} title={title} />
        </View>
        <WalletQRCodeView size={58} value={qrValue} borderColor={slots.accent} />
      </View>
    </WalletProRoot>
  );
}

const PROFESSIONAL_WALLET: Record<CardTemplateId, React.ComponentType<WalletProfessionalSectionProps>> = {
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

export function WalletProfessionalPassRenderer(props: WalletProfessionalSectionProps) {
  const Renderer = PROFESSIONAL_WALLET[props.section.templateId] ?? PROFESSIONAL_WALLET.classic;
  return <Renderer {...props} />;
}
