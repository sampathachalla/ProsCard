import { describe, expect, it } from 'vitest';
import {
  OpenAiProfileCopywriter,
  PROFILE_COPY_MODEL,
  PROFILE_COPY_PROMPT,
} from '../../onboarding/services/openai-profile-copywriter.service.js';

function fakeFetch(body: unknown, status = 200) {
  const calls: RequestInit[] = [];
  const impl = (async (_url: string, init: RequestInit) => {
    calls.push(init);
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe('AI profile copywriter', () => {
  it('uses structured output and supplies onboarding facts as untrusted JSON data', async () => {
    const output = {
      tagline: 'Software Engineer building dependable mobile experiences',
      shortBio: 'I build dependable mobile products at Northwind and care about clear, useful experiences.',
    };
    const { impl, calls } = fakeFetch({
      choices: [{ message: { content: JSON.stringify(output) } }],
    });
    const writer = new OpenAiProfileCopywriter({
      apiKey: 'sk-test',
      timeoutMs: 1000,
      fetchImpl: impl,
    });

    await expect(writer.generate({
      firstName: 'Sam',
      lastName: 'Patel',
      preferredName: '',
      title: 'Software Engineer',
      organization: 'Northwind',
      department: '',
      accreditations: '',
      businessAddress: 'New York',
    })).resolves.toEqual(output);

    const sent = JSON.parse(calls[0]!.body as string);
    expect(sent.model).toBe(PROFILE_COPY_MODEL);
    expect(sent.response_format.json_schema.strict).toBe(true);
    expect(sent.response_format.json_schema.schema.properties.tagline.maxLength).toBe(120);
    expect(sent.response_format.json_schema.schema.properties.shortBio.maxLength).toBe(240);
    expect(sent.messages[0].content).toBe(PROFILE_COPY_PROMPT);
    expect(sent.messages[1].content).toContain('"title":"Software Engineer"');
    expect(PROFILE_COPY_PROMPT).toContain('Never invent');
    expect(PROFILE_COPY_PROMPT).toContain('untrusted data');
  });

  it('rejects provider errors and output over the UI limits', async () => {
    const unavailable = new OpenAiProfileCopywriter({
      apiKey: 'sk-test',
      timeoutMs: 1000,
      fetchImpl: fakeFetch({ error: {} }, 429).impl,
    });
    await expect(unavailable.generate({ firstName: 'Sam' } as never)).rejects.toMatchObject({ status: 502 });

    const invalid = new OpenAiProfileCopywriter({
      apiKey: 'sk-test',
      timeoutMs: 1000,
      fetchImpl: fakeFetch({
        choices: [{ message: { content: JSON.stringify({ tagline: 'T'.repeat(121), shortBio: 'Bio' }) } }],
      }).impl,
    });
    await expect(invalid.generate({ firstName: 'Sam' } as never)).rejects.toMatchObject({ status: 502 });
  });
});
