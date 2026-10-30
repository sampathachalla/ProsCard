import { describe, expect, it } from 'vitest';
import {
  OpenAiProfileCopywriter,
  PROFILE_COPY_MODEL,
  PROFILE_COPY_PROMPT,
  pickTaglines,
} from '../../onboarding/services/openai-profile-copywriter.service.js';
import { generateProfileCopySchema } from '../../onboarding/utils/onboarding.schemas.js';

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

const facts = {
  firstName: 'Sam',
  lastName: 'Patel',
  preferredName: '',
  title: 'Data Engineer',
  organization: 'Northwind',
  department: '',
  accreditations: '',
  businessAddress: 'New York',
  focus: 'pipelines for hospital records',
};

const writerFor = (body: unknown, status = 200) => {
  const fetch = fakeFetch(body, status);
  return { writer: new OpenAiProfileCopywriter({ apiKey: 'sk-test', timeoutMs: 1000, fetchImpl: fetch.impl }), calls: fetch.calls };
};
const modelReply = (content: unknown) => ({ choices: [{ message: { content: JSON.stringify(content) } }] });

describe('AI profile copywriter', () => {
  it('sends the facts (including focus) as untrusted JSON and returns three tagline options', async () => {
    const { writer, calls } = writerFor(modelReply({
      taglineWhatTheyDo: 'Turning hospital records into data doctors can trust',
      taglineRoleAndCompany: 'Data engineer at Northwind',
      taglinePersonal: 'Making messy hospital data make sense',
      shortBio: 'I build the pipelines at Northwind that move hospital records into data care teams can rely on.',
    }));

    await expect(writer.generate(facts)).resolves.toEqual({
      tagline: 'Turning hospital records into data doctors can trust',
      taglines: [
        'Turning hospital records into data doctors can trust',
        'Data engineer at Northwind',
        'Making messy hospital data make sense',
      ],
      shortBio: 'I build the pipelines at Northwind that move hospital records into data care teams can rely on.',
    });

    const sent = JSON.parse(calls[0]!.body as string);
    expect(sent.model).toBe(PROFILE_COPY_MODEL);
    expect(sent.response_format.json_schema.strict).toBe(true);
    const properties = sent.response_format.json_schema.schema.properties;
    for (const key of ['taglineWhatTheyDo', 'taglineRoleAndCompany', 'taglinePersonal']) {
      expect(properties[key].maxLength).toBe(120);
    }
    expect(properties.shortBio.maxLength).toBe(240);
    expect(sent.messages[0].content).toBe(PROFILE_COPY_PROMPT);
    expect(sent.messages[1].content).toContain('"focus":"pipelines for hospital records"');
    expect(PROFILE_COPY_PROMPT).toContain('Never invent');
    expect(PROFILE_COPY_PROMPT).toContain('untrusted data');
  });

  it('drops stock-phrase and duplicate taglines', async () => {
    const { writer } = writerFor(modelReply({
      taglineWhatTheyDo: 'Passionate data engineer building the future',
      taglineRoleAndCompany: 'Data engineer at Northwind',
      taglinePersonal: 'Data Engineer at Northwind!',
      shortBio: 'I build data pipelines at Northwind.',
    }));
    const copy = await writer.generate(facts);
    expect(copy.taglines).toEqual(['Data engineer at Northwind']);
    expect(copy.tagline).toBe('Data engineer at Northwind');
  });

  it('keeps stock-phrase options only when nothing else is left', () => {
    expect(pickTaglines(['Passionate builder', 'Driving innovative solutions'])).toEqual([
      'Passionate builder',
      'Driving innovative solutions',
    ]);
    expect(pickTaglines(['Data-driven pipelines for clinics'])).toEqual(['Data-driven pipelines for clinics']);
  });

  it('accepts focus on its own and caps its length', () => {
    expect(generateProfileCopySchema.safeParse({ focus: 'helping farmers sell direct' }).success).toBe(true);
    expect(generateProfileCopySchema.safeParse({ focus: 'x'.repeat(161) }).success).toBe(false);
    expect(generateProfileCopySchema.safeParse({}).success).toBe(false);
  });

  it('rejects provider errors and output over the UI limits', async () => {
    await expect(writerFor({ error: {} }, 429).writer.generate(facts)).rejects.toMatchObject({ status: 502 });

    const tooLong = writerFor(modelReply({
      taglineWhatTheyDo: 'T'.repeat(121),
      taglineRoleAndCompany: 'Data engineer',
      taglinePersonal: 'Data person',
      shortBio: 'Bio',
    }));
    await expect(tooLong.writer.generate(facts)).rejects.toMatchObject({ status: 502 });

    const oldShape = writerFor(modelReply({ tagline: 'Old shape', shortBio: 'Bio' }));
    await expect(oldShape.writer.generate(facts)).rejects.toMatchObject({ status: 502 });
  });
});
