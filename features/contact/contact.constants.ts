import type { Icon } from '@/features/icons/types'
import { EmailIcon } from '@/features/icons/email-icon'
import { GithubIcon } from '@/features/icons/github-icon'
import { SlackIcon } from '@/features/icons/slack-icon'

export type ContactChannel = {
  id: string
  label: string
  href?: string
  external?: boolean
  Icon: Icon
}

export const CONTACT_EMAIL = 'szymon@dunsy.app'
export const CONTACT_GITHUB_REPO = 'szduda/redunsy'
export const CONTACT_GITHUB_URL = 'https://github.com/szduda/redunsy'
export const CONTACT_SLACK_CHANNEL = 'dunsy'
export const CONTACT_SLACK_URL = 'https://slack.com/app_redirect?channel=dunsy'

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'slack',
    label: CONTACT_SLACK_CHANNEL,
    href: CONTACT_SLACK_URL,
    external: true,
    Icon: SlackIcon,
  },
  {
    id: 'email',
    label: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    Icon: EmailIcon,
  },
  {
    id: 'github',
    label: CONTACT_GITHUB_REPO,
    href: CONTACT_GITHUB_URL,
    external: true,
    Icon: GithubIcon,
  },
]
