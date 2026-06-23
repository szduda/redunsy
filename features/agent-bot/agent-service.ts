import { Agent, CursorAgentError } from '@cursor/sdk'

import { buildSystemPrompt } from './system-prompt'

const REPO_URL = process.env.CURSOR_REPO_URL ?? 'https://github.com/szduda/redunsy'

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
            // Don't pass startingRef — Cursor's pre-flight branch validation
            // rejects freshly-created branches even when they exist on GitHub.
            // The system prompt tells the agent to git checkout the branch itself.
            repos: [{ url: REPO_URL }],
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

  // Cursor validates the branch during send(). If the GitHub ref hasn't
  // propagated yet, retry up to 2 more times with increasing back-off.
  let run: Awaited<ReturnType<typeof agent.send>>
  for (let attempt = 0; ; attempt++) {
    try {
      run = await agent.send(fullPrompt)
      break
    } catch (err) {
      const isValidationError =
        err instanceof CursorAgentError && (err as { code?: string }).code === 'validation_error'
      if (isValidationError && attempt < 2) {
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)))
        continue
      }
      throw err
    }
  }

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
