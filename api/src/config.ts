import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function plainUrl(value: string): string {
  const markdownTarget = value.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/)?.[1];
  return markdownTarget ?? value;
}

function localKeyPath(value: string): string {
  if (value.startsWith('/app/secrets/')) {
    return path.join(apiRoot, 'secrets', path.basename(value));
  }
  return path.isAbsolute(value) ? value : path.resolve(apiRoot, value);
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:8081,http://127.0.0.1:8081'),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  MEDIA_CLEANUP_INTERVAL_SECONDS: z.coerce.number().int().nonnegative().default(900),
  LOG_LEVEL: z.enum(['debug','info','warn','error']).default('info'),
  LOG_SINK_URL: z.preprocess(value=>value===''?undefined:value,z.string().url().optional()),
  LOG_SINK_TOKEN: z.preprocess(value=>value===''?undefined:value,z.string().optional()),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default('proscard'),
  DB_USER: z.string().default('proscard'),
  DB_PASSWORD: z.string().min(1),
  SUPABASE_URL: z.string().transform(plainUrl).pipe(z.string().url()),
  SUPABASE_SECRET_KEY: z.string().min(1),
  PASSWORD_RESET_REDIRECT_URL: z.string().url().default('http://localhost:8081/auth/reset-password'),
  OCI_REGION: z.string().min(1),
  OCI_NAMESPACE: z.string().min(1),
  OCI_BUCKET_NAME: z.string().min(1),
  OCI_TENANCY_OCID: z.string().min(1),
  OCI_USER_OCID: z.string().min(1),
  OCI_FINGERPRINT: z.string().min(1),
  OCI_PRIVATE_KEY_PATH: z.string().transform(localKeyPath),
  OCI_PRIVATE_KEY_PASSPHRASE: z.string().default(''),
  OCI_DOWNLOAD_URL_EXPIRES_SECONDS: z.coerce.number().int().positive().default(900),
  OCI_UPLOAD_URL_EXPIRES_SECONDS: z.coerce.number().int().positive().default(900),
  // OpenAI key used to read business-card photos; card reading is disabled when it is empty.
  LLM_API: z.string().default(''),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  SCANNER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  // Public address used in wallet-pass QR codes (the share page). Empty: taken from the incoming request.
  PUBLIC_WEB_URL: z.string().default(''),
  // Apple Wallet: a Pass Type ID certificate from the Apple Developer account. Empty disables Apple passes.
  APPLE_WALLET_PASS_TYPE_ID: z.string().default(''),
  APPLE_WALLET_TEAM_ID: z.string().default(''),
  APPLE_WALLET_CERT_PATH: z.string().default(''),
  APPLE_WALLET_KEY_PATH: z.string().default(''),
  APPLE_WALLET_KEY_PASSPHRASE: z.string().default(''),
  APPLE_WALLET_WWDR_PATH: z.string().default(''),
  // Google Wallet: issuer ID and a service-account key from the Google Pay & Wallet Console. Empty disables it.
  GOOGLE_WALLET_ISSUER_ID: z.string().default(''),
  GOOGLE_WALLET_SERVICE_ACCOUNT_PATH: z.string().default(''),
  // Signs the short-lived Apple pass download links; a random per-process value is used when empty.
  WALLET_LINK_SECRET: z.string().default(''),
}).superRefine((config, context) => {
  // Multi-instance production must share one secret or Apple pass links break across restarts/replicas.
  if (
    config.NODE_ENV === 'production'
    && config.APPLE_WALLET_PASS_TYPE_ID
    && !config.WALLET_LINK_SECRET
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['WALLET_LINK_SECRET'],
      message: 'WALLET_LINK_SECRET is required in production when Apple Wallet is enabled.',
    });
  }
});

export type AppConfig = z.infer<typeof schema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return schema.parse(environment);
}
