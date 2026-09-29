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
  OCI_UPLOAD_URL_EXPIRES_SECONDS: z.coerce.number().int().positive().default(900)
});

export type AppConfig = z.infer<typeof schema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return schema.parse(environment);
}
