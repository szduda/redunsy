import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { agentSessions } from './agent-session.schema'

export type AgentSession = {
  id: number
  threadId: string
  cursorAgentId: string
  branchName: string
  createdAt: Date
  updatedAt: Date
}

export type AgentStateProvider = {
  getSession: (threadId: string) => Promise<AgentSession | null>
  upsertSession: (
    data: Pick<AgentSession, 'threadId' | 'cursorAgentId' | 'branchName'>,
  ) => Promise<AgentSession>
}

export const createDrizzleStateProvider = (): AgentStateProvider => ({
  getSession: async (threadId) => {
    const rows = await db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.threadId, threadId))
      .limit(1)
    return rows[0] ?? null
  },

  upsertSession: async (data) => {
    const rows = await db
      .insert(agentSessions)
      .values(data)
      .onConflictDoUpdate({
        target: agentSessions.threadId,
        set: {
          cursorAgentId: data.cursorAgentId,
          branchName: data.branchName,
          updatedAt: new Date(),
        },
      })
      .returning()
    return rows[0]
  },
})
