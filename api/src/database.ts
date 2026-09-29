import pg from 'pg';
import type { AppConfig } from './config.js';

export function createPool(config: AppConfig): pg.Pool {
  return new pg.Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}
