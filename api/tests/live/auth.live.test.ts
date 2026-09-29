// Opt-in test: creates and removes a real Supabase Auth user.
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { loadConfig } from '../../src/config.js';

const liveConfigSchema = z.object({
  LIVE_TEST_EMAIL: z.string().email().optional(),
  LIVE_TEST_PASSWORD: z.string().min(8).optional(),
  LIVE_API_URL: z.string().url().default('http://127.0.0.1:8050'),
  LIVE_TEST_KEEP_USER: z.enum(['true', 'false']).default('false'),
});

const live = liveConfigSchema.parse(process.env);
const appConfig = loadConfig();
const email = live.LIVE_TEST_EMAIL ?? `proscard-live-${randomUUID()}@example.com`;
const password = live.LIVE_TEST_PASSWORD ?? randomBytes(24).toString('base64url');
const admin = createClient(appConfig.SUPABASE_URL, appConfig.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let createdUserId: string | undefined;

async function jsonResponse(response: Response): Promise<Record<string, unknown>> {
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof payload.message === 'string' ? payload.message : response.statusText;
    throw new Error(`${response.status} ${message}`);
  }
  return payload;
}

try {
  const signup = await jsonResponse(await fetch(`${live.LIVE_API_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));

  createdUserId = String((signup.user as Record<string, unknown> | undefined)?.id ?? '');
  if (!createdUserId) throw new Error('Signup succeeded without returning a user ID.');

  if (signup.emailConfirmationRequired) {
    const { error } = await admin.auth.admin.updateUserById(createdUserId, { email_confirm: true });
    if (error) throw new Error(`Could not confirm the generated test user: ${error.message}`);
  }

  const login = await jsonResponse(await fetch(`${live.LIVE_API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));
  if (typeof login.token !== 'string') throw new Error('Login succeeded without returning an access token.');
  if (typeof login.refreshToken !== 'string') throw new Error('Login succeeded without returning a refresh token.');

  const protectedResponse = await fetch(`${live.LIVE_API_URL}/api/v1/profiles/me`, {
    headers: { Authorization: `Bearer ${login.token}` },
  });
  if (![200, 404].includes(protectedResponse.status)) {
    throw new Error(`Protected-route verification failed with status ${protectedResponse.status}.`);
  }

  const resetResponse=await fetch(`${live.LIVE_API_URL}/api/v1/auth/forgot-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
  if(resetResponse.status!==202)throw new Error(`Password-reset request failed with ${resetResponse.status}.`);
  const newPassword=randomBytes(24).toString('base64url');
  const updateResponse=await fetch(`${live.LIVE_API_URL}/api/v1/auth/reset-password`,{method:'POST',headers:{Authorization:`Bearer ${login.token}`,'Content-Type':'application/json'},body:JSON.stringify({password:newPassword})});
  if(!updateResponse.ok)throw new Error(`Password update failed with ${updateResponse.status}.`);
  const oldLogin=await fetch(`${live.LIVE_API_URL}/api/v1/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});if(oldLogin.ok)throw new Error('Old password still works after rotation.');
  const rotatedLogin=await jsonResponse(await fetch(`${live.LIVE_API_URL}/api/v1/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:newPassword})}));
  const refreshed=await jsonResponse(await fetch(`${live.LIVE_API_URL}/api/v1/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:rotatedLogin.refreshToken})}));
  if(typeof refreshed.token!=='string'||typeof refreshed.refreshToken!=='string')throw new Error('Refresh did not rotate the session tokens.');
  const logoutResponse=await fetch(`${live.LIVE_API_URL}/api/v1/auth/logout`,{method:'POST',headers:{Authorization:`Bearer ${refreshed.token}`}});
  if(!logoutResponse.ok)throw new Error(`Logout failed with ${logoutResponse.status}.`);
  const rejectedRefresh=await fetch(`${live.LIVE_API_URL}/api/v1/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:refreshed.refreshToken})});
  if(rejectedRefresh.ok)throw new Error('Refresh token remained valid after global logout.');

  console.log('Live Supabase authentication passed:', {
    userCreated: true,
    loginSucceeded: true,
    bearerTokenAccepted: true,
    passwordResetAccepted: true,
    passwordUpdated: true,
    refreshSucceeded: true,
    logoutRevokedRefreshToken: true,
    profileExists: protectedResponse.status === 200,
  });
} finally {
  if (createdUserId && live.LIVE_TEST_KEEP_USER !== 'true') {
    const { error } = await admin.auth.admin.deleteUser(createdUserId);
    if (error) throw new Error(`Live test passed but cleanup failed: ${error.message}`);
    console.log('Temporary Supabase test user deleted.');
  }
}
