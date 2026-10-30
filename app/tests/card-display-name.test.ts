import { describe, expect, it } from 'vitest';
import { CARD_THEME_PRESETS, type BusinessCard } from '@/pages/cards/types/card.types';
import { hasAutomaticNameForTag, isCustomCardName, nextAutomaticCardName } from '@/pages/cards/Utils/cardDisplayName';

const theme = { ...CARD_THEME_PRESETS.navy, gradient: [...CARD_THEME_PRESETS.navy.gradient] as [string, string], fontStyle: 'modern' as const };

function card(id: string, tag: string, name = '', custom = false): BusinessCard {
  return {
    id, name: 'Sam', title: '', company: '', phone: '', email: '', gradient: [...theme.gradient], category: 'Professional',
    sectionLayouts: { identity: 'layout-1', professional: 'layout-1', connections: 'compact' },
    sectionThemes: { identity: theme, professional: theme, connections: theme },
    sectionOverrides: { cardTag: tag, displayName: name, displayNameCustomized: custom ? 'true' : 'false' },
    connectionFields: [], connectionFieldsCustomized: false, cardTheme: theme,
  };
}

describe('card names from the tag', () => {
  it('names the first card of a tag after the tag', () => {
    expect(nextAutomaticCardName(card('new', 'Personal'), []).name).toBe('Personal');
  });

  it('numbers the next card when one with that tag already exists', () => {
    const existing = [card('a', 'Personal', 'Personal'), card('b', 'Business', 'Business')];
    expect(nextAutomaticCardName(card('new', 'Personal'), existing).name).toBe('Personal 2');
    expect(nextAutomaticCardName(card('new', 'Personal'), [...existing, card('c', 'Personal', 'Personal 2')]).name).toBe('Personal 3');
  });

  it('does not reuse a number given before on this device', () => {
    expect(nextAutomaticCardName(card('new', 'Personal'), [], 2).name).toBe('Personal 3');
  });

  it('renames a card whose automatic name came from another tag (e.g. the onboarding card)', () => {
    expect(hasAutomaticNameForTag(card('a', 'Personal', 'Business'))).toBe(false);
    expect(hasAutomaticNameForTag(card('a', 'Personal', 'Professional'))).toBe(false);
    expect(hasAutomaticNameForTag(card('a', 'Personal', 'Personal 2'))).toBe(true);
  });

  it('never renames a name the user typed', () => {
    expect(isCustomCardName(card('a', 'Personal', 'Weekend gigs', true))).toBe(true);
    expect(isCustomCardName(card('a', 'Personal', 'Personal'))).toBe(false);
  });
});

describe('automatic name in the card editor', () => {
  it('fills the name for the chosen tag straight away', async () => {
    const { withAutomaticCardName } = await import('@/pages/cards/Utils/cardDisplayName');
    expect(withAutomaticCardName(card('new', 'Networking'), []).displayName).toBe('Networking');
    expect(withAutomaticCardName(card('new', 'Networking'), [card('a', 'Networking', 'Networking')]).displayName).toBe('Networking 2');
  });

  it('redoes an automatic name when the tag changes, but keeps a typed one', async () => {
    const { withAutomaticCardName } = await import('@/pages/cards/Utils/cardDisplayName');
    expect(withAutomaticCardName(card('a', 'Networking', 'Business'), []).displayName).toBe('Networking');
    expect(withAutomaticCardName(card('a', 'Networking', 'Conference card', true), []).sectionOverrides.displayName)
      .toBe('Conference card');
  });
});

describe('choosing a tag in the editor', () => {
  it('leaves a new card unnamed until a tag is chosen, then names it after that tag', async () => {
    const { withAutomaticCardName } = await import('@/pages/cards/Utils/cardDisplayName');
    const untagged = card('new', '');
    expect(withAutomaticCardName(untagged, []).sectionOverrides.displayName).toBe('');
    const personal = { ...untagged, sectionOverrides: { ...untagged.sectionOverrides, cardTag: 'Personal' } };
    expect(withAutomaticCardName(personal, []).displayName).toBe('Personal');
  });

  it('follows the tag even if an older build flagged the automatic name as typed', async () => {
    const { withAutomaticCardName } = await import('@/pages/cards/Utils/cardDisplayName');
    expect(withAutomaticCardName(card('a', 'Personal', 'Business', true), []).displayName).toBe('Personal');
  });
});
