import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';
import { CARD_READER_MODEL } from './openai-card-reader.service.js';
import { badgeReadingSchema, type BadgeReading, type ReadCardRequest } from '../utils/scanner.schemas.js';

const ROTATION_FOR_DIRECTION = {
  upright: 0,
  top_to_bottom: 270,
  upside_down: 180,
  bottom_to_top: 90,
} as const;
type TextDirection = keyof typeof ROTATION_FOR_DIRECTION;
type ScannedBadgeType = 'event_badge' | 'business_card' | 'other';

export interface BadgeReaderGateway {
  readBadge(input: ReadCardRequest): Promise<BadgeReading>;
}

type OpenAiBadgeReaderOptions = {
  apiKey: string;
  timeoutMs: number;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

const contactField = { type: 'string' };

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['badgeType', 'cardBounds', 'textDirection', 'contact', 'printedEventName'],
  properties: {
    badgeType: { type: 'string', enum: ['event_badge', 'business_card', 'other'] },
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
    printedEventName: contactField,
    contact: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'title', 'company'],
      properties: { name: contactField, title: contactField, company: contactField },
    },
  },
} as const;

const INSTRUCTIONS = `You read photos of conference or event badges (lanyard name tags) and return structured attendee details.

Rules:
- badgeType:
  - "event_badge": a name tag or conference badge worn at an event (often shows name, company, event branding).
  - "business_card": a traditional business card (use only when clearly not a badge).
  - "other": anything else.
- cardBounds: bounding box as fractions of the image (0 to 1), origin top-left. null if no badge/card visible.
- textDirection: how the main text reads in the image.
- contact: copy only what is printed. name = attendee full name; title = role or attendee type if shown; company = employer or organization on the badge.
- printedEventName: the event or conference name if printed on the badge (e.g. header banner text). "" if not shown.
- Use "" for fields not printed. Never invent details.`;

export class OpenAiBadgeReader implements BadgeReaderGateway {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: OpenAiBadgeReaderOptions) {
    this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async readBadge(input: ReadCardRequest): Promise<BadgeReading> {
    let response: Response;
    const started = Date.now();
    try {
      response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.options.apiKey}` },
        signal: AbortSignal.timeout(this.options.timeoutMs),
        body: JSON.stringify({
          model: CARD_READER_MODEL,
          response_format: { type: 'json_schema', json_schema: { name: 'event_badge', strict: true, schema: RESPONSE_SCHEMA } },
          messages: [
            { role: 'system', content: INSTRUCTIONS },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Read this event badge.' },
                { type: 'image_url', image_url: { url: `data:${input.mimeType};base64,${input.image.replace(/\s/g, '')}`, detail: 'high' } },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'TimeoutError';
      log('error', 'badge_reader_request_failed', { timedOut, message: error instanceof Error ? error.message : String(error) });
      throw new HttpError(timedOut ? 504 : 502, timedOut ? 'Reading the badge took too long. Please try again.' : 'Could not reach the badge reader.');
    }

    if (!response.ok) {
      log('error', 'badge_reader_rejected', { status: response.status });
      throw new HttpError(502, 'The badge reader could not process this photo.');
    }

    log('info', 'badge_reader_openai', { ms: Date.now() - started, imageKb: Math.round(input.image.length * 0.75 / 1024) });
    let payload: { choices?: { message?: { content?: string | null; refusal?: string | null } }[] };
    try {
      payload = (await response.json()) as typeof payload;
    } catch (error) {
      log('error', 'badge_reader_invalid_response', { message: error instanceof Error ? error.message : String(error) });
      throw new HttpError(502, 'The badge reader returned an unexpected answer.');
    }
    const message = payload.choices?.[0]?.message;
    if (!message?.content || message.refusal) {
      throw new HttpError(422, 'The badge reader could not read this photo.');
    }
    try {
      const { textDirection, badgeType, ...answer } = JSON.parse(message.content) as {
        textDirection?: TextDirection;
        badgeType?: ScannedBadgeType;
      };
      return badgeReadingSchema.parse({
        ...answer,
        isEventBadge: badgeType === 'event_badge',
        rotation: ROTATION_FOR_DIRECTION[textDirection ?? 'upright'] ?? 0,
      });
    } catch {
      log('error', 'badge_reader_invalid_output', { model: CARD_READER_MODEL });
      throw new HttpError(502, 'The badge reader returned an unexpected answer.');
    }
  }
}
