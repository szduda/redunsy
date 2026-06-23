import { serial, text, timestamp, pgTable, unique } from 'drizzle-orm/pg-core'

/**
 * Persists the mapping between a Slack thread and a running Cursor Cloud Agent session.
 * One row per thread — upserted on each new mention/follow-up.
 */
export const agentSessions = pgTable(
  'agent_sessions',
  {
    id: serial('id').primaryKey(),
    /** Chat SDK normalised thread ID, e.g. `slack:C123ABC:1234567890.123456` */
    threadId: text('thread_id').notNull(),
    /** Cursor Cloud Agent ID (bc-…) for resuming across turns */
    cursorAgentId: text('cursor_agent_id').notNull(),
    /** Git branch the agent is working on */
    branchName: text('branch_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('agent_sessions_thread_id_unique').on(t.threadId)],
)

export type AgentSession = typeof agentSessions.$inferSelect
export type AgentSessionInsert = typeof agentSessions.$inferInsert
