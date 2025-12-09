import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
})

export const db = drizzle(pool, { schema })

export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        base_email TEXT NOT NULL,
        generated_email TEXT NOT NULL UNIQUE,
        is_used BOOLEAN NOT NULL DEFAULT false,
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        note TEXT
      )
    `)
  } finally {
    client.release()
  }
}
