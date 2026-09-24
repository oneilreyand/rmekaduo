#!/usr/bin/env node

/**
 * Migration runner for PostgreSQL
 * Commands: up, down, status
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const migrationsDir = join(root, 'migrations');

// Muat .env secara native jika ada dan belum dimuat
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(join(root, '.env'));
  } catch {
    // Abaikan jika file .env belum ada
  }
}

export function createPool(customConfig = {}) {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return new Pool({ connectionString, ...customConfig });
  }

  return new Pool({
    host: process.env.PGHOST || '/tmp',
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || 'rme_dev',
    user: process.env.PGUSER || 'mac',
    password: process.env.PGPASSWORD || undefined,
    ...customConfig,
  });
}

export async function initMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function getAppliedMigrations(client) {
  await initMigrationTable(client);
  const result = await client.query('SELECT version FROM schema_migrations ORDER BY version ASC;');
  return new Set(result.rows.map((r) => r.version));
}

export async function migrateUp(pool) {
  const client = await pool.connect();
  try {
    const applied = await getAppliedMigrations(client);
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.up.sql'))
      .sort();

    let appliedCount = 0;
    for (const file of files) {
      const version = file.replace(/\.up\.sql$/, '');
      if (applied.has(version)) {
        continue;
      }

      process.stdout.write(`Applying migration ${version}... `);
      const sql = readFileSync(join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1);', [version]);
        await client.query('COMMIT');
        process.stdout.write('DONE\n');
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        process.stderr.write(`FAILED: ${err.message}\n`);
        throw err;
      }
    }

    if (appliedCount === 0) {
      process.stdout.write('Database is already up to date. No migrations to apply.\n');
    }
    return appliedCount;
  } finally {
    client.release();
  }
}

export async function migrateDown(pool) {
  const client = await pool.connect();
  try {
    const applied = await getAppliedMigrations(client);
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.down.sql'))
      .sort()
      .reverse();

    for (const file of files) {
      const version = file.replace(/\.down\.sql$/, '');
      if (!applied.has(version)) {
        continue;
      }

      process.stdout.write(`Rolling back migration ${version}... `);
      const sql = readFileSync(join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('DELETE FROM schema_migrations WHERE version = $1;', [version]);
        await client.query('COMMIT');
        process.stdout.write('DONE\n');
        return version;
      } catch (err) {
        await client.query('ROLLBACK');
        process.stderr.write(`FAILED: ${err.message}\n`);
        throw err;
      }
    }

    process.stdout.write('No migrations to roll back.\n');
    return null;
  } finally {
    client.release();
  }
}

export async function migrateStatus(pool) {
  const client = await pool.connect();
  try {
    const applied = await getAppliedMigrations(client);
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.up.sql'))
      .sort();

    process.stdout.write('\nMigration Status:\n');
    process.stdout.write('--------------------------------------------------\n');
    for (const file of files) {
      const version = file.replace(/\.up\.sql$/, '');
      const isApplied = applied.has(version);
      process.stdout.write(`[${isApplied ? 'APPLIED' : 'PENDING'}] ${version}\n`);
    }
    process.stdout.write('--------------------------------------------------\n\n');
  } finally {
    client.release();
  }
}

// CLI handler if called directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const command = process.argv[2] || 'up';
  const pool = createPool();

  try {
    if (command === 'up') {
      await migrateUp(pool);
    } else if (command === 'down') {
      await migrateDown(pool);
    } else if (command === 'status') {
      await migrateStatus(pool);
    } else {
      process.stderr.write(`Unknown command: ${command}. Use 'up', 'down', or 'status'.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
