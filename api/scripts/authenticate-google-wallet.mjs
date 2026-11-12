import 'dotenv/config';
import { GoogleAuth } from 'google-auth-library';

const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID?.trim();
const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL?.trim();

if (issuerId && serviceAccountEmail) {
  try {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    if (!await auth.getAccessToken()) throw new Error('No access token was returned');
    console.info('Google Wallet application credentials authenticated.');
  } catch {
    console.warn('Google Wallet application credentials could not authenticate. Check the API container’s Google credential configuration.');
  }
}
