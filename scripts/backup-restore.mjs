#!/usr/bin/env node

/**
 * PostgreSQL Backup & Restore Utility
 * Commands: backup, restore, verify
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from './migrate.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const backupsDir = join(root, 'backups');

const KEY_TABLES = [
  'organizations',
  'branches',
  'accounts',
  'roles',
  'permissions',
  'practitioners',
  'practitioner_branch_assignments',
  'polis',
  'schedules',
  'patients',
  'audit_logs',
];

export async function getTableCounts(pool) {
  const client = await pool.connect();
  const counts = {};
  try {
    for (const table of KEY_TABLES) {
      try {
        const res = await client.query(`SELECT count(*)::int as cnt FROM ${table};`);
        counts[table] = res.rows[0].cnt;
      } catch (e) {
        counts[table] = -1; // table might not exist
      }
    }
    return counts;
  } finally {
    client.release();
  }
}

function resolveDatabaseUrl(databaseUrl) {
  const resolved = databaseUrl || process.env.DATABASE_URL;
  if (!resolved) {
    throw new Error('DATABASE_URL wajib diisi untuk backup atau restore.');
  }

  return resolved;
}

export function performBackup(customPath, databaseUrl) {
  if (!existsSync(backupsDir)) {
    mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetFile = customPath || join(backupsDir, `rme_backup_${timestamp}.sql`);
  const connectionUrl = resolveDatabaseUrl(databaseUrl);

  process.stdout.write(`Creating backup to: ${targetFile}... `);
  execFileSync('pg_dump', ['--dbname', connectionUrl, '--clean', '--if-exists', '--file', targetFile], {
    stdio: 'inherit',
  });
  process.stdout.write('DONE\n');
  return targetFile;
}

export function performRestore(backupFile, databaseUrl, options = {}) {
  if (!existsSync(backupFile)) {
    throw new Error(`Backup file not found: ${backupFile}`);
  }

  if (!options.allowRestore && process.env.RME_ALLOW_RESTORE !== '1') {
    throw new Error('Restore diblokir. Set RME_ALLOW_RESTORE=1 setelah memverifikasi database target.');
  }

  const connectionUrl = resolveDatabaseUrl(databaseUrl);

  process.stdout.write(`Restoring backup from: ${backupFile}... `);
  execFileSync('psql', ['--dbname', connectionUrl, '--file', backupFile], { stdio: 'inherit' });
  process.stdout.write('DONE\n');
}

// CLI handler if called directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const command = process.argv[2] || 'backup';
  const arg = process.argv[3];
  const pool = createPool();

  try {
    if (command === 'backup') {
      const counts = await getTableCounts(pool);
      process.stdout.write(`Current record counts:\n${JSON.stringify(counts, null, 2)}\n`);
      const file = performBackup(arg, process.env.DATABASE_URL);
      process.stdout.write(`Backup successfully saved: ${file}\n`);
    } else if (command === 'restore') {
      if (!arg) {
        process.stderr.write('Please provide backup file path to restore.\n');
        process.exitCode = 1;
      } else {
        performRestore(arg, process.env.DATABASE_URL);
        const counts = await getTableCounts(pool);
        process.stdout.write(`Restored record counts:\n${JSON.stringify(counts, null, 2)}\n`);
      }
    } else {
      process.stderr.write(`Unknown command: ${command}. Use 'backup' or 'restore'.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    process.stderr.write(`Operation failed: ${err.message}\n`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
