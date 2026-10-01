import { describe, expect, it } from 'vitest';
import { CARD_READER_MODEL, OpenAiCardReader } from '../../scanner/services/openai-card-reader.service.js';
import { isPlaceholder, normalizeBounds, ScannerService } from '../../scanner/services/scanner.service.js';
import type { CardReading } from '../../scanner/utils/scanner.schemas.js';

const reading: CardReading = {
  isBusinessCard: true,
  cardBounds: { x: 0.1, y: 0.2, width: 0.8, height: 0.5 },
  rotation: 0,
  contact: { name: 'Ada Lovelace', title: 'Analyst', company: 'Engines Ltd', phone: '+44 20 1234 5678', email: 'MAILTO:Ada@Engines.io', website: 'engines.io', address: '', notes: '' },
};

function fakeFetch(body: unknown, status = 200) {
  const calls: RequestInit[] = [];
  const impl = (async (_url: string, init: RequestInit) => {
    calls.push(init);
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe('business card scanner', () => {
  it('clamps card bounds into the image and drops unusable boxes', () => {
    expect(normalizeBounds({ x: -0.1, y: 0.2, width: 0.8, height: 0.5 })).toEqual({ x: 0, y: 0.2, width: 0.7, height: 0.5 });
    expect(normalizeBounds({ x: 0.5, y: 0.5, width: 0.02, height: 0.3 })).toBeNull();
    expect(normalizeBounds({ x: 0, y: 0, width: 1, height: 1 })).toBeNull();
    expect(normalizeBounds(null)).toBeNull();
  });

  it('treats business-card template filler as missing', () => {
    for (const filler of ['YOUR CITY ADDRESS STREET LOCATION, NY CITY, USA', 'INFO@COMPANYNAME.COM', 'WWW.COMPANY-NAME.COM',
      'www.yourwebsite.com', 'Company Name', 'Your Name', 'john@example.com', 'Lorem ipsum dolor', '123-456-7890', 'Slogan goes here']) {
      expect(isPlaceholder(filler), filler).toBe(true);
    }
    for (const real of ['500 Market St, San Francisco', 'priya.raman@northwind.io', 'www.northwind.io', 'Northwind Analytics',
      'Priya Raman', '+1 (415) 555-0199', 'Head of Product Design', 'Your Dental Care Ltd']) {
      expect(isPlaceholder(real), real).toBe(false);
    }
  });

  it('blanks placeholder fields and never fills notes', async () => {
    const result = await new ScannerService({
      read: async () => ({ ...reading, contact: { ...reading.contact, address: 'YOUR CITY ADDRESS, NY', website: 'www.company-name.com', notes: 'extra' } }),
    }).readCard({ image: 'abc', mimeType: 'image/jpeg' });
    expect(result.contact.address).toBe('');
    expect(result.contact.website).toBe('');
    expect(result.contact.notes).toBe('');
    expect(result.contact.name).toBe('Ada Lovelace');
  });

  it('reports a clear error when no LLM key is configured', async () => {
    await expect(new ScannerService().readCard({ image: 'abc', mimeType: 'image/jpeg' })).rejects.toMatchObject({ status: 503 });
  });

  it('cleans the reading before returning it', async () => {
    const result = await new ScannerService({ read: async () => reading }).readCard({ image: 'abc', mimeType: 'image/jpeg' });
    expect(result.contact.email).toBe('ada@engines.io');
    expect(result.cardBounds).toEqual(reading.cardBounds);
  });

  it('sends the photo to OpenAI with a strict schema and parses the answer', async () => {
    const { rotation: _rotation, ...answer } = reading;
    const { impl, calls } = fakeFetch({ choices: [{ message: { content: JSON.stringify({ ...answer, textDirection: 'upside_down' }) } }] });
    const reader = new OpenAiCardReader({ apiKey: 'sk-test', timeoutMs: 1000, fetchImpl: impl });
    const result = await reader.read({ image: 'aGVsbG8=', mimeType: 'image/png' });
    expect(result.contact.name).toBe('Ada Lovelace');
    expect(result.rotation).toBe(180);
    const sent = JSON.parse(calls[0]!.body as string);
    expect(sent.model).toBe(CARD_READER_MODEL);
    expect(CARD_READER_MODEL).toBe('gpt-5.4-mini');
    expect(sent.response_format.json_schema.strict).toBe(true);
    expect(sent.messages[1].content[1].image_url.url).toBe('data:image/png;base64,aGVsbG8=');
    expect((calls[0]!.headers as Record<string, string>).Authorization).toBe('Bearer sk-test');
  });

  it('turns OpenAI failures and refusals into safe API errors', async () => {
    const rejected = new OpenAiCardReader({ apiKey: 'k', timeoutMs: 1000, fetchImpl: fakeFetch({ error: {} }, 401).impl });
    await expect(rejected.read({ image: 'a', mimeType: 'image/jpeg' })).rejects.toMatchObject({ status: 502 });
    const refused = new OpenAiCardReader({ apiKey: 'k', timeoutMs: 1000, fetchImpl: fakeFetch({ choices: [{ message: { content: null, refusal: 'no' } }] }).impl });
    await expect(refused.read({ image: 'a', mimeType: 'image/jpeg' })).rejects.toMatchObject({ status: 422 });
  });
});
