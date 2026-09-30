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

export class ScannerService {
  constructor(private readonly reader?: CardReaderGateway) {}

  async readCard(input: ReadCardRequest): Promise<CardReading> {
    if (!this.reader) throw new HttpError(503, 'Card reading is not configured on the server.');
    const reading = await this.reader.read(input);
    return {
      ...reading,
      cardBounds: reading.isBusinessCard ? normalizeBounds(reading.cardBounds) : null,
      contact: {
        ...reading.contact,
        email: reading.contact.email.replace(/^mailto:/i, '').toLowerCase(),
      },
    };
  }
}
