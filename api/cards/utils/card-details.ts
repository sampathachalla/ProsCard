type Json = Record<string, unknown>;

export type CardDetails = {
  /** The name on the card face, which may be a short preferred name. */
  name: string;
  /** The person's whole name for a saved contact, where "Ada" alone would lose the surname. */
  contactName: string;
  title: string;
  company: string;
  emails: string[];
  phones: string[];
  website: string;
  address: string;
};

type ContactRow = { id: string; title: string; type: string; value: string };

const DEFAULT_CARD_NAME = 'My VC Pros';
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const firstFilled = (...values: unknown[]) => values.map(str).find(Boolean) ?? '';

/** Same order as the app's resolveIdentityPreferredName, so every output names the person as the card does. */
function cardName(card: Json, overrides: Json, profile: Json): string {
  const override = str(overrides.preferredName);
  if (override && override !== DEFAULT_CARD_NAME) return override;
  const name = str(card.name);
  return firstFilled(
    profile.preferredName,
    [str(profile.firstName), str(profile.lastName)].filter(Boolean).join(' '),
    profile.fullName,
    name === DEFAULT_CARD_NAME ? '' : name,
    override,
  );
}

/** A card with its own rows shows exactly those, so a row the owner removed stays off; others use the account. */
function contactRows(card: Json, profile: Json): ContactRow[] {
  if (card.connectionFieldsCustomized === true) {
    return (Array.isArray(card.connectionFields) ? card.connectionFields : [])
      .filter((row): row is Json => Boolean(row) && typeof row === 'object')
      .map((row) => ({ id: str(row.id).toLowerCase(), title: str(row.title).toLowerCase(), type: str(row.type).toLowerCase(), value: str(row.value) }))
      .filter((row) => row.value);
  }
  return [
    { id: 'email', title: 'email', type: 'email', value: firstFilled(card.email, profile.email) },
    { id: 'phone', title: 'phone', type: 'phone', value: firstFilled(card.phone, profile.phone) },
    { id: 'website', title: 'website', type: 'url', value: str(profile.website) },
    { id: 'address', title: 'address', type: 'text', value: str(profile.businessAddress) },
  ].filter((row) => row.value);
}

/**
 * What a card shows, resolved like the app's card renderer (cardDetailTemplate.ts): a card-level override
 * first, then the card's own field, then the owner's profile. Wallet passes, vCards and QR scans all use
 * this rather than the stored top-level fields, so they match the card on the phone. A blank value always
 * falls through to the next source.
 */
export function resolveCardDetails(card: Json, profile: Json | null | undefined): CardDetails {
  const overrides = (card.sectionOverrides ?? {}) as Json;
  const owner = profile ?? {};
  const rows = contactRows(card, owner);
  return {
    name: cardName(card, overrides, owner),
    contactName: firstFilled(
      str(overrides.preferredName) === DEFAULT_CARD_NAME ? '' : overrides.preferredName,
      str(card.name) === DEFAULT_CARD_NAME ? '' : card.name,
      owner.fullName,
    ),
    title: firstFilled(overrides.title, card.title, owner.title),
    company: firstFilled(overrides.company, card.company, owner.organization),
    emails: rows.filter((row) => row.type === 'email').map((row) => row.value),
    phones: rows.filter((row) => row.type === 'phone').map((row) => row.value),
    website: rows.find((row) => row.id === 'website' || row.title === 'website')?.value ?? '',
    address: rows.find((row) => row.id === 'address' || /address|location/.test(row.title))?.value ?? '',
  };
}
