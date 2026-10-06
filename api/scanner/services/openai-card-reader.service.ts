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
type ScannedCardType = 'business_card' | 'payment_card' | 'other';

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
  required: ['cardType', 'cardBounds', 'textDirection', 'contact'],
  properties: {
    cardType: { type: 'string', enum: ['business_card', 'payment_card', 'other'] },
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
      // Notes are the user's own; the reader never fills them.
      required: ['name', 'title', 'company', 'phone', 'email', 'website', 'address'],
      properties: {
        name: contactField, title: contactField, company: contactField, phone: contactField,
        email: contactField, website: contactField, address: contactField,
      },
    },
  },
} as const;

const INSTRUCTIONS = `You read photos of business cards and return structured contact details.

Rules:
- cardType must be one of:
  - "business_card": a card whose purpose is to share a person's or organization's professional contact information.
  - "payment_card": any credit, debit, bank, prepaid, ATM or gift card, including virtual-card screenshots.
  - "other": IDs, licenses, membership/loyalty cards, insurance cards, transit cards, hotel key cards, blank cards, and anything else.
- A person's name, company/bank logo, card-shaped object, or 16-digit number does not make a payment card a business card.
- Cards showing payment features such as a card number, expiration date, CVV/CVC, EMV chip, magnetic stripe, payment-network logo, or "debit"/"credit" must be "payment_card" and never "business_card".
- Use "business_card" only when the card clearly contains professional contact information such as a job title, business email, phone number, business address, website, or social/profile link.
- cardBounds: the card's bounding box as fractions of the image (0 to 1), origin at the top-left of the image exactly as given: x and y are the card's top-left corner, width and height its size. Fit it tightly around the card's physical edges, not just the text. null if there is no card.
- textDirection: how the card's main text reads in the image as given:
  "upright" (left to right, normal), "upside_down", "top_to_bottom" (lines run downward, letters' tops face right),
  or "bottom_to_top" (lines run upward, letters' tops face left).
- contact: copy text exactly as printed. name is the person's full name; title their job title; company the organisation.
  phone: the first (main) phone number, including country code if printed. Ignore any other numbers.
  email and website without extra words; address as one line.
- Use "" for anything that is not printed on the card. Never invent, guess or move details into another field.
- Template placeholder text is not a real detail: use "" for fields that only contain generic filler such as
  "Company Name", "Your Name", "Your City Address", "Street Location", "info@companyname.com",
  "www.company-name.com", "www.yourwebsite.com", "123 Street", "Lorem ipsum" or "Slogan goes here".`;

export class OpenAiCardReader implements CardReaderGateway {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: OpenAiCardReaderOptions) {
    this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async read(input: ReadCardRequest): Promise<CardReading> {
    let response: Response;
    const started = Date.now();
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

    // Separates OpenAI time from the photo upload, which the request log's duration includes.
    log('info', 'card_reader_openai', { ms: Date.now() - started, imageKb: Math.round(input.image.length * 0.75 / 1024) });
    const payload = await response.json() as { choices?: { message?: { content?: string | null; refusal?: string | null } }[] };
    const message = payload.choices?.[0]?.message;
    if (!message?.content || message.refusal) {
      throw new HttpError(422, 'The card reader could not read this photo.');
    }
    try {
      const { textDirection, cardType, ...answer } = JSON.parse(message.content) as {
        textDirection?: TextDirection;
        cardType?: ScannedCardType;
      };
      return cardReadingSchema.parse({
        ...answer,
        isBusinessCard: cardType === 'business_card',
        rotation: ROTATION_FOR_DIRECTION[textDirection ?? 'upright'] ?? 0,
      });
    } catch {
      log('error', 'card_reader_invalid_output', { model: CARD_READER_MODEL });
      throw new HttpError(502, 'The card reader returned an unexpected answer.');
    }
  }
}
