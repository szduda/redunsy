# redunsy

Redunsy is a Next.js app for dunsy rhythm practice tools and experiments.

## Getting started

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Useful commands:

```bash
npm run lint
npm run format:check
npm run test
npm run db:migrate
```

## Slack agent integration

Redunsy includes a Slack-to-Cursor Cloud Agent bridge. The Slack app sends Events API webhooks to `POST /api/slack`, where the Chat SDK Slack adapter receives mentions and streams Cursor Cloud Agent responses back into the same Slack thread.

### Configuration

The deployed app needs these environment variables:

- `SLACK_BOT_TOKEN` - Slack bot token used by `@chat-adapter/slack`.
- `SLACK_SIGNING_SECRET` - Slack signing secret used to verify Events API webhooks.
- `CURSOR_API_KEY` - Cursor API key used to create and resume Cloud Agent sessions.
- `GITHUB_TOKEN` - GitHub token used to create agent branches.
- `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, or `DATABASE_URL` - Postgres connection string for Chat SDK state and agent session state.

Optional overrides:

- `CURSOR_REPO_URL` - repository URL passed to Cursor Cloud Agents. Defaults to `https://github.com/szduda/redunsy`.
- `GITHUB_REPO_OWNER` - GitHub owner used for branch creation. Defaults to `szduda`.
- `GITHUB_REPO_NAME` - GitHub repository used for branch creation. Defaults to `redunsy`.
- `GITHUB_BASE_BRANCH` - branch new agent branches are created from. Defaults to `master`.
- `VERCEL_PROJECT_SLUG` - project slug used when displaying a preview URL. Defaults to `redunsy`.
- `VERCEL_SCOPE_SLUG` - Vercel scope slug used when displaying a preview URL. Defaults to `szduda`.

The Slack app should subscribe its Event Request URL to:

```text
https://<deployment-host>/api/slack
```

For local testing, run `npm run dev`, expose the local server with a tunnel, and point the Slack Event Request URL at the tunneled `/api/slack` route.

### Starting an agent from Slack

Mention the bot in Slack with a coding task:

```text
@dunsy-agent add or update the rhythm search filters
```

On a new mention, the bot:

1. Subscribes to the Slack thread so follow-up replies go to the same agent session.
2. Creates a branch named `agent/<prompt-slug>-<suffix>` from `GITHUB_BASE_BRANCH`.
3. Posts the branch name and computed Vercel preview URL back to Slack.
4. Starts a Cursor Cloud Agent against the Redunsy repository.
5. Prepends the project system prompt from `features/agent-bot/system-prompt.ts`, which tells the agent to check out the branch first, run lint/format after changes, commit, push, and summarize the result.
6. Streams the agent's response back into the Slack thread.

Reply in the same Slack thread to continue the task. Follow-up messages resume the stored Cursor Cloud Agent session for that thread and reuse the same branch.

### How state works

- Chat SDK Slack conversation state is stored with `@chat-adapter/state-pg`.
- Redunsy's agent session mapping is stored in the `agent_sessions` table.
- Each Slack thread maps to one Cursor Cloud Agent ID and one git branch.
- New messages can interrupt a long-running turn because the bot uses `onLockConflict: 'force'`.

### Limitations and tradeoffs

- The model is not pinned in this repository. `Agent.create()` does not pass a model option, so runs use the Cursor Cloud Agent default for the configured account/project.
- No MCP servers are configured for the Slack-launched agent. This keeps the integration simpler and avoids extra MCP authentication/secrets, but the agent cannot call project-specific MCP tools unless Cursor Cloud provides them separately.
- The webhook route sets `maxDuration = 300`, so very long agent runs may outlive the function window and stop streaming updates to Slack.
- The bot creates and pushes to branches, but it does not explicitly open pull requests unless the user asks the agent to do so and the agent has that capability.
- The preview URL is computed from branch naming conventions; it does not verify that the Vercel preview deployment has finished.
