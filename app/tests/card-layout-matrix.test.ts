import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  IDENTITY_LAYOUT_IDS,
  PROFESSIONAL_LAYOUT_IDS,
  CONNECTION_LAYOUT_IDS,
  IDENTITY_LAYOUT_STYLES,
  PROFESSIONAL_LAYOUT_STYLES,
  resolveLayoutStyle,
  resolveIdentityTemplateId,
  DEFAULT_CARD_THEME,
  type BusinessCard,
} from '@/pages/cards/types/card.types';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import {
  getEffectiveCardContentWidth,
  getProfessionalTaglineFontSize,
  getResponsiveSingleLineFontSize,
  getResponsiveAccreditationLimit,
  CARD_TEXT_LIMITS,
} from '@/utils/cardTextLayout';
import type { Profile } from '@/pages/profile/types/profile.types';

const STRESS_PROFILES: Array<{ label: string; profile: Profile; card: BusinessCard }> = [
  {
    label: 'Max Budget Latin & Punctuation',
    profile: {
      id: 'test-user-1',
      fullName: 'Dr. Alexander M. Montgomery-Smith Jr.',
      firstName: 'Alexander',
      middleName: 'Maximilian',
      lastName: 'Montgomery-Smith',
      prefix: 'Prof. Dr.',
      suffix: 'MD, PhD',
      preferredName: 'Alex Montgomery-Smith',
      title: 'Chief Information Security Exec',
      organization: 'International Cyber Solutions Ltd.',
      department: 'Global Security & Operations',
      tagline: 'Leading enterprise transformation & strategy 2026',
      shortBio: 'Pioneering next-generation architecture for distributed enterprise cloud environments with resilient zero-trust security postures and global scale.',
      accreditations: 'CISSP, CISM, AWS-SAP, PMP',
      email: 'alexander.montgomery-smith@international-cyber-solutions.example.com',
      phone: '+1 (555) 019-2831 ext 4920',
      website: 'https://international-cyber-solutions.example.com/leadership/alexander',
      social: {
        linkedin: 'https://linkedin.com/in/alexander-montgomery-smith-cyber-exec',
        x: 'https://x.com/alex_cyber_security',
        github: 'https://github.com/alex-montgomery-security-lab',
      },
    },
    card: {
      id: 'card-1',
      userId: 'test-user-1',
      category: 'Corporate Networking',
      name: 'Alexander Montgomery-Smith',
      title: 'Chief Information Security Exec',
      company: 'International Cyber Solutions Ltd.',
      phone: '+1 (555) 019-2831',
      email: 'alexander@example.com',
      gradient: ['#0f172a', '#1e293b'],
      isPrimary: true,
      sectionLayouts: {
        identity: 'classic',
        professional: 'classic',
        connections: 'classic',
      },
      sectionThemes: {
        identity: {},
        professional: {},
        connections: {},
      },
      sectionOverrides: {
        prefix: 'Prof. Dr.',
        firstName: 'Alexander',
        middleName: 'M.',
        lastName: 'Montgomery',
        suffix: 'PhD',
        cardTag: 'Global Enterprise',
        title: 'Chief Information Security Exec',
        company: 'International Cyber Solutions Ltd.',
        tagline: 'Leading enterprise transformation & strategy 2026',
        bio: 'Pioneering next-generation architecture for distributed enterprise cloud environments with resilient zero-trust security postures.',
        accreditations: 'CISSP, CISM, PMP',
      },
      connectionFields: [
        { id: '1', title: 'Work Email', type: 'email', value: 'very.long.corporate.work.address@enterprise.solutions.corporation.co.uk' },
        { id: '2', title: 'Portfolio', type: 'url', value: 'https://enterprise.solutions.corporation.co.uk/team/members/profile/alexander-m' },
        { id: '3', title: 'Direct Line', type: 'phone', value: '+1 (800) 555-0199 ext 8820' },
      ],
      connectionFieldsCustomized: true,
      cardTheme: DEFAULT_CARD_THEME,
    },
  },
  {
    label: 'Unicode, CJK & Composite Emojis',
    profile: {
      id: 'test-user-2',
      fullName: '山田 太郎 🚀👨‍👩‍👧‍👦',
      firstName: '太郎 👨‍💻',
      lastName: '山田',
      preferredName: 'ヤマダ ⚡️',
      title: '最高技術責任者 (CTO) 🌐',
      organization: '未来テクノロジー株式会社 🏢',
      tagline: '革新的なAIプロダクトをグローバルに展開中 🔥✨',
      shortBio: 'クラウド、機械学習、モバイルアプリケーションのアーキテクチャ設計をリードしています。',
      accreditations: '情報処理安全確保支援士, PMP',
      email: 'yamada.taro@mirai-tech.example.co.jp',
      phone: '03-1234-5678',
      social: {},
    },
    card: {
      id: 'card-2',
      userId: 'test-user-2',
      category: 'テクノロジー',
      name: '山田 太郎 🚀',
      title: '最高技術責任者 (CTO) 🌐',
      company: '未来テクノロジー株式会社 🏢',
      phone: '03-1234-5678',
      email: 'yamada@example.co.jp',
      gradient: ['#1e1b4b', '#312e81'],
      isPrimary: false,
      sectionLayouts: {
        identity: 'minimal',
        professional: 'spotlight',
        connections: 'compact',
      },
      sectionThemes: { identity: {}, professional: {}, connections: {} },
      sectionOverrides: {
        cardTag: '開発チーム 🚀',
        title: '最高技術責任者 (CTO) 🌐',
        company: '未来テクノロジー株式会社 🏢',
        tagline: '革新的なAIプロダクトをグローバルに展開中 🔥✨',
        accreditations: '情報処理安全確保支援士',
      },
      connectionFields: [],
      connectionFieldsCustomized: false,
      cardTheme: DEFAULT_CARD_THEME,
    },
  },
  {
    label: 'Empty & Minimal Fields',
    profile: {
      id: 'test-user-3',
      fullName: '',
      email: '',
      social: {},
    },
    card: {
      id: 'card-3',
      userId: 'test-user-3',
      category: 'Personal',
      name: '',
      title: '',
      company: '',
      phone: '',
      email: '',
      gradient: ['#000000', '#333333'],
      isPrimary: false,
      sectionLayouts: {
        identity: 'editorial',
        professional: 'badge',
        connections: 'banner',
      },
      sectionThemes: { identity: {}, professional: {}, connections: {} },
      sectionOverrides: {},
      connectionFields: [],
      connectionFieldsCustomized: false,
      cardTheme: DEFAULT_CARD_THEME,
    },
  },
];

describe('Card Layout Matrix & Field Verification', () => {
  it('creates valid card detail template models for all 8 identity layout variants', () => {
    for (const layoutId of IDENTITY_LAYOUT_IDS) {
      const templateStyle = IDENTITY_LAYOUT_STYLES[layoutId];
      expect(templateStyle).toBeDefined();

      for (const { card, profile } of STRESS_PROFILES) {
        const testCard: BusinessCard = {
          ...card,
          sectionLayouts: { ...card.sectionLayouts, identity: layoutId },
        };
        const sections = createCardDetailTemplate(testCard, profile);
        expect(sections).toHaveLength(3);
        const identitySection = sections.find((s) => s.id === 'identity');
        expect(identitySection).toBeDefined();
        expect(identitySection?.templateId).toBe(resolveIdentityTemplateId(layoutId));
        expect(identitySection?.fields.length).toBeGreaterThan(0);
      }
    }
  });

  it('creates valid card detail template models for all 8 professional layout variants', () => {
    for (const layoutId of PROFESSIONAL_LAYOUT_IDS) {
      const templateStyle = PROFESSIONAL_LAYOUT_STYLES[layoutId];
      expect(templateStyle).toBeDefined();

      for (const { card, profile } of STRESS_PROFILES) {
        const testCard: BusinessCard = {
          ...card,
          sectionLayouts: { ...card.sectionLayouts, professional: layoutId },
        };
        const sections = createCardDetailTemplate(testCard, profile);
        const proSection = sections.find((s) => s.id === 'professional');
        expect(proSection).toBeDefined();
        expect(proSection?.templateId).toBe(resolveLayoutStyle(layoutId, 'professional'));
      }
    }
  });

  it('creates valid card detail template models for all 8 connection layout variants', () => {
    for (const layoutId of CONNECTION_LAYOUT_IDS) {
      for (const { card, profile } of STRESS_PROFILES) {
        const testCard: BusinessCard = {
          ...card,
          sectionLayouts: { ...card.sectionLayouts, connections: layoutId },
        };
        const sections = createCardDetailTemplate(testCard, profile);
        const connSection = sections.find((s) => s.id === 'connections');
        expect(connSection).toBeDefined();
        expect(connSection?.templateId).toBe(resolveLayoutStyle(layoutId, 'connections'));
      }
    }
  });

  describe('Responsive font calculations across multiple viewports', () => {
    const VIEWPORTS = [320, 360, 375, 390, 414, 520, 768];

    it('getResponsiveSingleLineFontSize stays within minimum and maximum boundaries', () => {
      for (const width of VIEWPORTS) {
        for (let charCount = 1; charCount <= 50; charCount += 5) {
          const fontSize = getResponsiveSingleLineFontSize(width * 0.6, charCount, 16, 32);
          expect(fontSize).toBeGreaterThanOrEqual(16);
          expect(fontSize).toBeLessThanOrEqual(32);
        }
      }
    });

    it('getProfessionalTaglineFontSize stays within readable limits for any character count', () => {
      for (const width of VIEWPORTS) {
        const fullTagline = 'W'.repeat(CARD_TEXT_LIMITS.tagline);
        const regularSize = getProfessionalTaglineFontSize(width, fullTagline.length, false);
        const compactSize = getProfessionalTaglineFontSize(width, fullTagline.length, true);

        expect(regularSize).toBeGreaterThanOrEqual(14);
        expect(regularSize).toBeLessThanOrEqual(18);
        expect(compactSize).toBeGreaterThanOrEqual(13);
        expect(compactSize).toBeLessThanOrEqual(16);
      }
    });

    it('getResponsiveAccreditationLimit adapts to viewport safely', () => {
      for (const width of VIEWPORTS) {
        const limit = getResponsiveAccreditationLimit(width);
        expect(limit).toBeGreaterThanOrEqual(16);
        expect(limit).toBeLessThanOrEqual(CARD_TEXT_LIMITS.accreditations);
      }
    });

    it('getEffectiveCardContentWidth respects min and max limits', () => {
      expect(getEffectiveCardContentWidth(200)).toBe(280); // clamps up to min 280
      expect(getEffectiveCardContentWidth(390)).toBe(390);
      expect(getEffectiveCardContentWidth(900)).toBe(520); // clamps down to max 520
    });
  });
});
