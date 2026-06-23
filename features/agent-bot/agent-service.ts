import { Agent, CursorAgentError } from '@cursor/sdk'

import { buildSystemPrompt } from './system-prompt'

const REPO_URL = process.env.CURSOR_REPO_URL ?? 'github.com/szduda/redunsy'

const apiKey = () => {
  const key = process.env.CURSOR_API_KEY
  if (!key) throw new ConfigError('CURSOR_API_KEY is not set')
  return key
}

class ConfigError extends Error {}

type AgentStreamParams = {
  existingAgentId: string | null
  branchName: string
  prompt: string
  onAgentIdReady: (agentId: string) => Promise<void>
}

/**
 * Returns an AsyncIterable<string> of the agent's text output.
 * Calls `onAgentIdReady` with the agentId as soon as the agent is created/resumed,
 * so the caller can persist it before the stream is consumed.
 *
 * The agent handle is disposed automatically when the async generator is exhausted or thrown.
 */
export const createAgentStream = async ({
  existingAgentId,
  branchName,
  prompt,
  onAgentIdReady,
}: AgentStreamParams): Promise<AsyncIterable<string>> => {
  let agent: Awaited<ReturnType<typeof Agent.create>>

  try {
    agent = existingAgentId
      ? await Agent.resume(existingAgentId, { apiKey: apiKey() })
      : await Agent.create({
          apiKey: apiKey(),
          cloud: {
            repos: [{ url: REPO_URL, startingRef: branchName }],
            skipReviewerRequest: true,
          },
        })
  } catch (err) {
    if (err instanceof CursorAgentError) {
      throw new Error(`Cursor agent failed to start: ${err.message}`)
    }
    throw err
  }

  await onAgentIdReady(agent.agentId)

  const fullPrompt = existingAgentId
    ? prompt
    : `${buildSystemPrompt(branchName)}\n\n${prompt}`

  const run = await agent.send(fullPrompt)

  return {
    [Symbol.asyncIterator]() {
      return (async function* () {
        try {
          for await (const event of run.stream()) {
            if (event.type === 'assistant') {
              for (const block of event.message.content) {
                if (block.type === 'text') yield block.text
              }
            }
          }
          const result = await run.wait()
          if (result.status === 'error') {
            yield `\n\n⚠️ Agent run ended with an error (run ID: ${result.id})`
          }
        } finally {
          await agent[Symbol.asyncDispose]()
        }
      })()
    },
  }
}
