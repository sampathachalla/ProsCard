import { HttpError } from '../../src/errors.js';
import type { CardBounds, CardReading, ReadCardRequest } from '../utils/scanner.schemas.js';
import type { CardReaderGateway } from './openai-card-reader.service.js';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const round = (value: number) => Math.round(value * 10000) / 10000;

/** Keeps the box inside the image; drops boxes too small to be a real card or covering the whole photo. */
export function normalizeBounds(bounds: CardBounds | null): CardBounds | null {
  if (!bounds || ![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite)) return null;
  const x = clamp(bounds.x);
  const y = clamp(bounds.y);
  const width = clamp(bounds.x + bounds.width) - x;
  const height = clamp(bounds.y + bounds.height) - y;
  if (width < 0.1 || height < 0.1) return null;
  if (width > 0.97 && height > 0.97) return null;
  return { x: round(x), y: round(y), width: round(width), height: round(height) };
}

/**
 * Filler text printed on business-card templates. A field containing any of these is not a real detail,
 * even if the model copied it (e.g. "YOUR CITY ADDRESS STREET LOCATION, NY CITY, USA").
 */
const PLACEHOLDER_PATTERNS = [
  /\byour\s+(name|city|address|company|website|email|title|position|phone|street|location)\b/i,
  /\bstreet\s+location\b/i,
  /\bcompany[\s-]*name\b/i,
  /\bslogan\s+(goes\s+)?here\b/i,
  /\blorem\s+ipsum\b/i,
  /\b(your|my)?(website|company[-]?name|domain)\.(com|net|org)\b/i,
  /@(example|domain|email|yourcompany|companyname)\./i,
  /\bexample\.(com|net|org)\b/i,
  /\b(123|000)[-\s]?(456|000)[-\s]?(7890|0000)\b/,
  /\b(name|job|position)\s+(here|title)\b/i,
];

export function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

export class ScannerService {
  constructor(private readonly reader?: CardReaderGateway) {}

  async readCard(input: ReadCardRequest): Promise<CardReading> {
    if (!this.reader) throw new HttpError(503, 'Card reading is not configured on the server.');
    const reading = await this.reader.read(input);
    const contact = Object.fromEntries(
      Object.entries(reading.contact).map(([key, value]) => [key, isPlaceholder(value) ? '' : value.trim()]),
    ) as CardReading['contact'];
    return {
      ...reading,
      cardBounds: reading.isBusinessCard ? normalizeBounds(reading.cardBounds) : null,
      contact: {
        ...contact,
        email: contact.email.replace(/^mailto:/i, '').toLowerCase(),
        // Notes are the user's own; never filled from the card.
        notes: '',
      },
    };
  }
}
