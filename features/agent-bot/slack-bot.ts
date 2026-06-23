import pg from 'pg'
import { Chat } from 'chat'
import { createSlackAdapter } from '@chat-adapter/slack'
import { createPostgresState } from '@chat-adapter/state-pg'

import { createBranch } from './github-service'
import { promptToBranchName, branchToPreviewUrl } from './vercel-preview'
import { createAgentStream } from './agent-service'
import { createDrizzleStateProvider } from './agent-state'

const agentState = createDrizzleStateProvider()

/**
 * @chat-adapter/state-pg uses node-postgres (pg) which rejects Supabase's
 * self-signed cert by default. We create the Pool explicitly so we can pass
 * ssl: { rejectUnauthorized: false } — same trust level as our postgres.js client.
 */
const pgPool = new pg.Pool({
  connectionString:
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const bot = new Chat({
  userName: 'dunsy-agent',
  adapters: {
    slack: createSlackAdapter(),
  },
  state: createPostgresState({ client: pgPool }),
  /**
   * Force-release any existing lock so a new Slack message can interrupt
   * a long-running agent turn (e.g. user sends a correction mid-run).
   */
  onLockConflict: 'force',
  fallbackStreamingPlaceholderText: '⏳ Starting agent...',
})

bot.onNewMention(async (thread, message) => {
  await thread.subscribe()

  const branchName = promptToBranchName(message.text)
  const previewUrl = branchToPreviewUrl(branchName)

  await thread.post(
    `Creating branch \`${branchName}\`...\n> Preview: ${previewUrl}`,
  )

  await createBranch(branchName)

  const stream = await createAgentStream({
    existingAgentId: null,
    branchName,
    prompt: message.text,
    onAgentIdReady: (agentId) =>
      agentState
        .upsertSession({ threadId: thread.id, cursorAgentId: agentId, branchName })
        .then(() => undefined),
  })

  await thread.post(stream)
})

bot.onSubscribedMessage(async (thread, message) => {
  const session = await agentState.getSession(thread.id)

  if (!session) {
    await thread.post('No active agent session found for this thread.')
    return
  }

  const stream = await createAgentStream({
    existingAgentId: session.cursorAgentId,
    branchName: session.branchName,
    prompt: message.text,
    onAgentIdReady: () => Promise.resolve(),
  })

  await thread.post(stream)
})
