# Contracts: Card Text Safety & Validation Interfaces

## 1. Client Card Text Helper Contract (`app/utils/cardTextLayout.ts`)

```typescript
export interface CardTextLayoutAPI {
  // Constants
  CARD_TEXT_LIMITS: {
    displayName: 48;
    professionalName: 32;
    namePart: 24;
    prefix: 12;
    suffix: 12;
    cardTag: 24;
    title: 32;
    company: 32;
    accreditations: 24;
    tagline: 48;
    bio: 180;
  };
  CONTACT_TEXT_LIMITS: {
    name: 48;
    title: 32;
    company: 32;
    eventName: 48;
    phone: 32;
    email: 80;
    website: 96;
    address: 120;
    notes: 500;
  };

  // Unicode safe cluster splitting
  splitGraphemes(value: string): string[];

  // Word-boundary aware truncation
  fitCardText(value: string, maxLength: number): string;

  // Adaptive full name fitting
  fitProfessionalName(
    parts: {
      prefix?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      suffix?: string;
    },
    maxLength?: number
  ): string;

  // Viewport-aware formatters
  fitTaglineToViewport(tagline: string, viewportWidth?: number): string;
  fitAccreditationsToViewport(value: string, viewportWidth?: number): string;
  getResponsiveSingleLineFontSize(
    availableWidth: number,
    characterCount: number,
    minimum: number,
    maximum: number,
    averageGlyphWidth?: number
  ): number;
}
```

## 2. API Validation Contract (`api/cards/utils/card.schemas.ts`)

```typescript
export interface CardPatchPayloadContract {
  category?: string;
  name?: string; // min 1, max 32
  title?: string; // max 32
  company?: string; // max 32
  phone?: string; // max 100
  email?: string; // valid email format or empty
  sectionOverrides?: {
    displayName?: string; // max 48
    preferredName?: string; // max 32
    prefix?: string; // max 12
    suffix?: string; // max 12
    firstName?: string; // max 24
    middleName?: string; // max 24
    lastName?: string; // max 24
    cardTag?: string; // max 24
    title?: string; // max 32
    company?: string; // max 32
    accreditations?: string; // max 24
    tagline?: string; // max 48
    bio?: string; // max 180
    // Constraint: (prefix + firstName + middleName + lastName + suffix) <= 32
  };
  connectionFields?: Array<{
    id: string;
    type: 'text' | 'email' | 'phone' | 'url';
    value: string; // text <= 120, phone <= 100, email <= 254, url <= 2048
  }>;
}
```
