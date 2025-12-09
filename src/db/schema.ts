import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  baseEmail: text('base_email').notNull(),
  generatedEmail: text('generated_email').notNull().unique(),
  isUsed: boolean('is_used').notNull().default(false),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  note: text('note'),
})

export type Email = typeof emails.$inferSelect
export type NewEmail = typeof emails.$inferInsert
