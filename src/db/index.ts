import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Database client — talks to the Supabase Postgres backend via DATABASE_URL.
 *
 * Nothing here may throw at import/build time. The pool and drizzle
 * instance are created lazily on first real use and only then complain
 * if DATABASE_URL is missing.
 */
const globalForDb = globalThis as typeof globalThis & {
  __khangPool?: Pool;
  __khangDb?: NodePgDatabase;
};

function getDb(): NodePgDatabase {
  if (globalForDb.__khangDb) return globalForDb.__khangDb;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required (Supabase → Project Settings → Database → Connection string → URI).",
    );
  }
  // Supabase (and every other hosted Postgres) requires SSL; local Postgres does not.
  const isLocal = /localhost|127\.0\.0\.1/.test(databaseUrl);
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
  const instance = drizzle(pool);
  globalForDb.__khangPool = pool;
  globalForDb.__khangDb = instance;
  return instance;
}

/** Lazy drizzle client — behaves exactly like `drizzle(pool)` once used. */
export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export function getPool(): Pool {
  getDb();
  return globalForDb.__khangPool!;
}
