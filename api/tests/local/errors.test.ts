import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from '../../src/errors.js';

function appThrowing(error: unknown) {
  const app = express();
  app.use(express.json({ limit: '1kb' }));
  app.post('/echo', (q, r) => r.json(q.body));
  app.get('/fail', () => { throw error; });
  app.use(errorHandler);
  return app;
}

function pgError(code: string) {
  return Object.assign(new Error(`postgres ${code}`), { code });
}

describe('error handler', () => {
  it('returns 400 for a malformed JSON body instead of 500', async () => {
    const response = await request(appThrowing(null)).post('/echo').set('Content-Type', 'application/json').send('{"broken"');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('The request body is not valid JSON.');
  });

  it('returns 413 for a body over the size limit', async () => {
    const response = await request(appThrowing(null)).post('/echo').send({ text: 'x'.repeat(4096) });
    expect(response.status).toBe(413);
  });

  it('maps input-caused Postgres errors to client statuses', async () => {
    expect((await request(appThrowing(pgError('22P02'))).get('/fail')).status).toBe(400);
    expect((await request(appThrowing(pgError('23505'))).get('/fail')).status).toBe(409);
  });

  it('hides unexpected errors behind a generic 500', async () => {
    const response = await request(appThrowing(new Error('secret connection string'))).get('/fail');
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error.');
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });

  it('maps database-unavailable Postgres codes to 503', async () => {
    const response = await request(appThrowing(pgError('57P03'))).get('/fail');
    expect(response.status).toBe(503);
    expect(response.body.message).toBe('The database is temporarily unavailable.');
  });

  it('maps network dependency failures to 503', async () => {
    const error = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' });
    const response = await request(appThrowing(error)).get('/fail');
    expect(response.status).toBe(503);
    expect(response.body.message).toBe('A dependent service is temporarily unavailable.');
  });

  it('does not leak vendor text from SDK 4xx status codes', async () => {
    const error = Object.assign(new Error('OCI Authorization failed: secret-key'), { statusCode: 401 });
    const response = await request(appThrowing(error)).get('/fail');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('The request could not be processed.');
    expect(JSON.stringify(response.body)).not.toContain('secret-key');
  });
});
