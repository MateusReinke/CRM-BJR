import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
// `pg` ships as CommonJS without named ESM exports, so it must be imported
// as a default import and destructured at runtime; the type-only import
// below still works because it reads the .d.ts directly.
import pg from 'pg';
import type { Pool as NodePgPool } from 'pg';
const { Pool: NodePgPoolCtor } = pg;
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Neon's serverless driver talks to Neon's own WebSocket proxy, so it only
// works against a real Neon endpoint. Any other Postgres (local dev, other
// hosts, CI) falls back to the standard node-postgres driver.
const isNeonDatabase = /\.neon\.tech(:|\/|$)/.test(process.env.DATABASE_URL);

let pool: NeonPool | NodePgPool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNodePg>;

if (isNeonDatabase) {
  neonConfig.webSocketConstructor = ws;
  const neonPool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  pool = neonPool;
  db = drizzleNeon({ client: neonPool, schema });
} else {
  const nodePgPool = new NodePgPoolCtor({ connectionString: process.env.DATABASE_URL });
  pool = nodePgPool;
  db = drizzleNodePg(nodePgPool, { schema });
}

export { pool, db };
