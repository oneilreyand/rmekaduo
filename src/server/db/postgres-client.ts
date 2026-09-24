import { Pool, type PoolClient, type QueryResultRow } from 'pg';

let poolInstance: Pool | null = null;

export interface DatabaseExecutor {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<R[]>;
}

function toExecutor(client: PoolClient): DatabaseExecutor {
  return {
    async query<R extends QueryResultRow = QueryResultRow>(
      text: string,
      params: unknown[] = []
    ): Promise<R[]> {
      const result = await client.query<R>(text, params);
      return result.rows;
    },
  };
}

export function getDbPool(): Pool {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      poolInstance = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      poolInstance = new Pool({
        host: process.env.PGHOST || '/tmp',
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'rme_dev',
        user: process.env.PGUSER || 'mac',
        password: process.env.PGPASSWORD || undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
  }

  return poolInstance;
}

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<R[]> {
  const pool = getDbPool();
  const result = await pool.query<R>(text, params);
  return result.rows;
}

/**
 * Jalankan satu perubahan bisnis sebagai unit atomik. Semua write dan audit
 * terkait harus menggunakan executor yang diberikan agar commit/rollback sama.
 */
export async function withTransaction<T>(
  work: (executor: DatabaseExecutor) => Promise<T>
): Promise<T> {
  const client = await getDbPool().connect();

  try {
    await client.query('BEGIN');
    const result = await work(toExecutor(client));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function checkDbHealth(): Promise<{ ok: boolean; message: string; database?: string }> {
  try {
    const pool = getDbPool();
    const rows = await query<{ current_database: string; now: Date }>(
      'SELECT current_database(), now();'
    );
    if (rows.length > 0 && rows[0]) {
      return {
        ok: true,
        message: 'Database connection healthy',
        database: rows[0].current_database,
      };
    }
    return { ok: false, message: 'Database returned no rows' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Database connection failed: ${message}` };
  }
}

export async function closeDbPool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
