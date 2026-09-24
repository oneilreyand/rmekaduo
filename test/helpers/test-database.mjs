import { createPool } from '../../scripts/migrate.mjs';

const testDatabaseUrl = process.env.RME_TEST_DATABASE_URL;

export const testDatabaseSkipReason = testDatabaseUrl
  ? undefined
  : 'RME_TEST_DATABASE_URL wajib diisi dengan database disposable bernama rme_test…';

export function getTestDatabaseUrl() {
  if (!testDatabaseUrl) {
    throw new Error(testDatabaseSkipReason);
  }

  const parsed = new URL(testDatabaseUrl);
  const databaseName = parsed.pathname.replace(/^\//, '');
  if (!/^rme_test(?:[_-]|$)/.test(databaseName)) {
    throw new Error('RME_TEST_DATABASE_URL harus menunjuk database disposable bernama rme_test…');
  }

  return testDatabaseUrl;
}

export function createTestPool() {
  const connectionString = getTestDatabaseUrl();
  // Server services resolve their pool lazily from DATABASE_URL. Point them at
  // the same disposable database as the test pool, never PGDATABASE.
  process.env.DATABASE_URL = connectionString;
  return createPool({ connectionString });
}
