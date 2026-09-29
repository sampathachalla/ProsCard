// Opt-in test: uses real Supabase Auth and local PostgreSQL, then cleans up both.
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { loadConfig } from '../../src/config.js';
import { createPool } from '../../src/database.js';

const liveConfig = z.object({
  LIVE_API_URL: z.string().url().default('http://127.0.0.1:8050'),
}).parse(process.env);

const config = loadConfig();
const pool = createPool(config);
const admin = createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const email = `proscard-profile-${randomUUID()}@example.com`;
const password = randomBytes(24).toString('base64url');
let userId: string | undefined;

const testProfile = {
  prefix: 'Dr.',
  firstName: 'Live',
  middleName: '',
  lastName: 'Profile',
  suffix: '',
  preferredName: 'Live Profile',
  accreditations: 'Test Account',
  fullName: 'Dr. Live Profile',
  title: 'Integration Tester',
  department: 'Quality Engineering',
  organization: 'ProsCard',
  companyLogoUrl: '',
  coverPhotoUrl: '',
  email,
  phone: '+1 555 010 9999',
  photoUrl: '',
  website: 'https://example.com',
  social: { github: 'https://github.com/example', linkedin: 'https://linkedin.com/in/example' },
  tagline: 'Live profile persistence test',
  businessAddress: 'Test Address',
  shortBio: 'Temporary profile created by the opt-in live integration test.',
};

async function jsonResponse(response: Response): Promise<Record<string, unknown>> {
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof payload.message === 'string' ? payload.message : response.statusText;
    throw new Error(`${response.status} ${message}`);
  }
  return payload;
}

try {
  const signup = await jsonResponse(await fetch(`${liveConfig.LIVE_API_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));
  userId = String((signup.user as Record<string, unknown> | undefined)?.id ?? '');
  if (!userId) throw new Error('Signup succeeded without returning a user ID.');

  if (signup.emailConfirmationRequired) {
    const { error } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
    if (error) throw new Error(`Could not confirm test user: ${error.message}`);
  }

  const login = await jsonResponse(await fetch(`${liveConfig.LIVE_API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));
  if (typeof login.token !== 'string') throw new Error('Login did not return an access token.');
  const headers = { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' };

  const saved = await jsonResponse(await fetch(`${liveConfig.LIVE_API_URL}/api/v1/profiles/me`, {
    method: 'PUT', headers, body: JSON.stringify(testProfile),
  }));
  const fetched = await jsonResponse(await fetch(`${liveConfig.LIVE_API_URL}/api/v1/profiles/me`, {
    headers: { Authorization: `Bearer ${login.token}` },
  }));

  if (saved.userId !== userId || fetched.userId !== userId) throw new Error('Profile ownership does not match the Supabase user.');
  if (fetched.fullName !== testProfile.fullName || fetched.email !== email) throw new Error('Profile fields did not round-trip through the API.');
  if ((fetched.social as Record<string, unknown>).github !== testProfile.social.github) throw new Error('Social fields did not round-trip through the API.');

  const database = await pool.query<{ data: Record<string, unknown> }>('SELECT data FROM profiles WHERE user_id=$1', [userId]);
  if (database.rowCount !== 1 || database.rows[0]?.data.fullName !== testProfile.fullName) {
    throw new Error('The profile was not persisted correctly in PostgreSQL.');
  }

  console.log('Live profile persistence passed:', {
    realSupabaseUser: true,
    authenticatedProfileWrite: true,
    authenticatedProfileRead: true,
    postgresqlRecordVerified: true,
  });
} finally {
  if (userId) {
    await pool.query('DELETE FROM profiles WHERE user_id=$1', [userId]);
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(`Cleanup failed: ${error.message}`);
    console.log('Temporary profile and Supabase user deleted.');
  }
  await pool.end();
}
