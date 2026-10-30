import { isCardTag, resolveCardTag } from '@/pages/addCard/Config/cardTagDesignPresets';
import { CARD_TAG_OPTIONS, type BusinessCard } from '../types/card.types';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const storedName = (card: BusinessCard) =>
  card.displayName?.trim() || card.sectionOverrides.displayName?.trim() || '';

/** "Business", "Personal 2"…: names the app gives, whichever tag they came from. */
const AUTOMATIC_NAME = new RegExp(`^(${CARD_TAG_OPTIONS.map(escapeRegExp).join('|')})(\\s+\\d+)?$`, 'i');

/**
 * A name the user typed. One that is exactly an automatic name counts as automatic even when flagged as
 * typed (older builds set the flag loosely), so it still follows the tag.
 */
export const isCustomCardName = (card: BusinessCard) => {
  const name = storedName(card);
  const flagged = Boolean(card.displayNameCustomized || card.sectionOverrides.displayNameCustomized === 'true');
  return Boolean(name) && flagged && !AUTOMATIC_NAME.test(name);
};

/**
 * Whether the card already carries an automatic name for its current tag ("Personal", "Personal 2").
 * A name from a different tag or an older naming scheme does not count, so it gets renamed.
 */
export function hasAutomaticNameForTag(card: BusinessCard) {
  const name = storedName(card);
  return Boolean(name) && new RegExp(`^${escapeRegExp(resolveCardTag(card))}(\\s+\\d+)?$`, 'i').test(name);
}

/**
 * Next automatic name for the card's tag: the tag itself for the first card, then "Tag 2", "Tag 3"…
 * `highestUsed` is the largest number ever given for that tag on this device, so numbers are not reused.
 */
export function nextAutomaticCardName(card: BusinessCard, otherCards: BusinessCard[], highestUsed = 0) {
  const tag = resolveCardTag(card);
  const numbered = new RegExp(`^${escapeRegExp(tag)}\\s+(\\d+)$`, 'i');
  const usedNumbers = otherCards
    .filter((item) => item.id !== card.id && resolveCardTag(item) === tag)
    .map((item) => {
      const name = storedName(item);
      if (!name || name.toLowerCase() === tag.toLowerCase()) return 1;
      const match = name.match(numbered);
      return match ? Number(match[1]) : 0;
    });
  const sequence = Math.max(highestUsed, ...usedNumbers, 0) + 1;
  return { tag, sequence, name: sequence === 1 ? tag : `${tag} ${sequence}` };
}

/**
 * The card with its automatic name filled in when it has no name of its own for its tag, so the editor
 * shows "Networking" (or "Networking 2") as soon as the tag is chosen. Names the user typed are kept.
 */
export function withAutomaticCardName(card: BusinessCard, otherCards: BusinessCard[]): BusinessCard {
  // Until a tag is chosen the field keeps its placeholder rather than guessing "Business".
  const tag = card.sectionOverrides.cardTag;
  if (!tag || !isCardTag(tag)) return card;
  if (isCustomCardName(card) || hasAutomaticNameForTag(card)) return card;
  const { name } = nextAutomaticCardName(card, otherCards);
  return {
    ...card,
    displayName: name,
    displayNameCustomized: false,
    sectionOverrides: { ...card.sectionOverrides, displayName: name, displayNameCustomized: 'false' },
  };
}
