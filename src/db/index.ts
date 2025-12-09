import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './schema'

export const db = drizzle(sql, { schema })

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS emails (
      id SERIAL PRIMARY KEY,
      base_email TEXT NOT NULL,
      generated_email TEXT NOT NULL UNIQUE,
      is_used BOOLEAN NOT NULL DEFAULT false,
      used_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      note TEXT
    )
  `
}
