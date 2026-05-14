import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

export type DbClient = BetterSQLite3Database<typeof schema> | DrizzleD1Database<typeof schema>;

interface DbAdapterOptions {
  sqliteDb?: BetterSQLite3Database<typeof schema>;
  d1Db?: DrizzleD1Database<typeof schema>;
}

export class DbAdapter {
  private db: DbClient;

  constructor(options: DbAdapterOptions) {
    if (options.d1Db) {
      this.db = options.d1Db;
    } else if (options.sqliteDb) {
      this.db = options.sqliteDb;
    } else {
      throw new Error('Either sqliteDb or d1Db must be provided');
    }
  }

  getDb(): DbClient {
    return this.db;
  }
}

export function createDbAdapter(env?: {
  DB?: D1Database;
  sqlite?: any;
}): DbAdapter {
  if (env?.DB) {
    // Production: Cloudflare D1
    const db = drizzleD1(env.DB, { schema });
    return new DbAdapter({ d1Db: db });
  } else if (env?.sqlite) {
    // Development: SQLite
    const db = drizzleSqlite(env.sqlite, { schema });
    return new DbAdapter({ sqliteDb: db });
  } else {
    throw new Error('No database binding found. Ensure DB or sqlite is configured.');
  }
}

export default DbAdapter;
