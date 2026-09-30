import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';
import { cardReadingSchema, type CardReading, type ReadCardRequest } from '../utils/scanner.schemas.js';

/**
 * Models name text direction far more reliably than they pick a rotation angle,
 * so the model reports the direction and we convert it to clockwise degrees.
 */
const ROTATION_FOR_DIRECTION = {
  upright: 0,
  top_to_bottom: 270,
  upside_down: 180,
  bottom_to_top: 90,
} as const;
type TextDirection = keyof typeof ROTATION_FOR_DIRECTION;

export interface CardReaderGateway {
  read(input: ReadCardRequest): Promise<CardReading>;
}

/**
 * Chosen by benchmark against gpt-5.4-nano, gpt-5-nano, gpt-4o-mini and the gpt-4.1 family: the only model
 * that reliably found the card edges, rejected non-card photos and read every field, at ~1–2 s per scan.
 */
export const CARD_READER_MODEL = 'gpt-5.4-mini';

type OpenAiCardReaderOptions = {
  apiKey: string;
  timeoutMs: number;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

const contactField = { type: 'string' };

/** Strict structured-output schema: every key is required, so the model always returns the full shape. */
const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['isBusinessCard', 'cardBounds', 'textDirection', 'contact'],
  properties: {
    isBusinessCard: { type: 'boolean' },
    cardBounds: {
      anyOf: [
        {
          type: 'object',
          additionalProperties: false,
          required: ['x', 'y', 'width', 'height'],
          properties: { x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } },
        },
        { type: 'null' },
      ],
    },
    textDirection: { type: 'string', enum: Object.keys(ROTATION_FOR_DIRECTION) },
    contact: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'title', 'company', 'phone', 'email', 'website', 'address', 'notes'],
      properties: {
        name: contactField, title: contactField, company: contactField, phone: contactField,
        email: contactField, website: contactField, address: contactField, notes: contactField,
      },
    },
  },
} as const;

const INSTRUCTIONS = `You read photos of business cards and return structured contact details.

Rules:
- isBusinessCard: true only if the photo clearly shows a business card.
- cardBounds: the card's bounding box as fractions of the image (0 to 1), origin at the top-left of the image exactly as given: x and y are the card's top-left corner, width and height its size. Fit it tightly around the card's physical edges, not just the text. null if there is no card.
- textDirection: how the card's main text reads in the image as given:
  "upright" (left to right, normal), "upside_down", "top_to_bottom" (lines run downward, letters' tops face right),
  or "bottom_to_top" (lines run upward, letters' tops face left).
- contact: copy text exactly as printed. name is the person's full name; title their job title; company the organisation.
  phone: the main phone number including country code if printed; put any other numbers in notes.
  email and website without extra words; address as one line.
  notes: other useful printed details (extra phones, fax, social handles, taglines), separated by "; ".
- Use "" for anything that is not printed on the card. Never invent details.`;

export class OpenAiCardReader implements CardReaderGateway {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: OpenAiCardReaderOptions) {
    this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async read(input: ReadCardRequest): Promise<CardReading> {
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.options.apiKey}` },
        signal: AbortSignal.timeout(this.options.timeoutMs),
        body: JSON.stringify({
          model: CARD_READER_MODEL,
          response_format: { type: 'json_schema', json_schema: { name: 'business_card', strict: true, schema: RESPONSE_SCHEMA } },
          messages: [
            { role: 'system', content: INSTRUCTIONS },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Read this business card.' },
                { type: 'image_url', image_url: { url: `data:${input.mimeType};base64,${input.image.replace(/\s/g, '')}`, detail: 'high' } },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'TimeoutError';
      log('error', 'card_reader_request_failed', { timedOut, message: error instanceof Error ? error.message : String(error) });
      throw new HttpError(timedOut ? 504 : 502, timedOut ? 'Reading the card took too long. Please try again.' : 'Could not reach the card reader.');
    }

    if (!response.ok) {
      // The body can echo request details, so only the status is logged.
      log('error', 'card_reader_rejected', { status: response.status });
      throw new HttpError(502, 'The card reader could not process this photo.');
    }

    const payload = await response.json() as { choices?: { message?: { content?: string | null; refusal?: string | null } }[] };
    const message = payload.choices?.[0]?.message;
    if (!message?.content || message.refusal) {
      throw new HttpError(422, 'The card reader could not read this photo.');
    }
    try {
      const { textDirection, ...answer } = JSON.parse(message.content) as { textDirection?: TextDirection };
      return cardReadingSchema.parse({ ...answer, rotation: ROTATION_FOR_DIRECTION[textDirection ?? 'upright'] ?? 0 });
    } catch {
      log('error', 'card_reader_invalid_output', { model: CARD_READER_MODEL });
      throw new HttpError(502, 'The card reader returned an unexpected answer.');
    }
  }
}
