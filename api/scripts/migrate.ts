import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config.js';
import { createPool } from '../src/database.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'database/migrations');
const pool = createPool(loadConfig());

try {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations(
       name TEXT PRIMARY KEY,
       checksum TEXT NOT NULL,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`,
  );
  const names = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
  for (const name of names) {
    const sql = await readFile(path.join(directory, name), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const existing = await pool.query<{ checksum: string }>(
      'SELECT checksum FROM schema_migrations WHERE name=$1',
      [name],
    );
    if (existing.rows[0]) {
      if (existing.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
      continue;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [name, checksum]);
      await client.query('COMMIT');
      console.log(`Applied ${name}`);
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error(
          `Rollback failed after ${name}:`,
          rollbackError instanceof Error ? rollbackError.message : rollbackError,
        );
      }
      throw error;
    } finally {
      client.release();
    }
  }
  console.log('Database migrations are current.');
} finally {
  await pool.end();
}
