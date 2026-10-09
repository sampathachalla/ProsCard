import pg from 'pg';
import type { AppConfig } from './config.js';
import { log } from './logger.js';

export function createPool(config: AppConfig): pg.Pool {
  const pool = new pg.Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30_000,
    // Fail a request quickly when the database is unreachable instead of hanging until the client gives up.
    connectionTimeoutMillis: 10_000,
  });
  // An idle client losing its connection (database restart, network blip) emits 'error' on the pool.
  // Without a listener Node treats it as unhandled and exits the process; the pool replaces the client itself.
  pool.on('error', (error) => {
    log('error', 'database_idle_client_error', { message: error.message });
  });
  return pool;
}
