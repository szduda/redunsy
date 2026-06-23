import { after } from 'next/server'

import { bot } from '@/features/agent-bot/slack-bot'

/**
 * Slack Events API webhook.
 *
 * Passes `after` as the `waitUntil` provider so the Vercel function stays alive
 * for the full agent run without blocking the 3-second Slack acknowledgment window.
 */
export const POST = (request: Request) =>
  bot.webhooks.slack(request, { waitUntil: (p) => after(() => p) })

/** Allow Vercel functions to run up to 300 s (the platform maximum). */
export const maxDuration = 300
