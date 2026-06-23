'use client'

import { useState, type FormEvent } from 'react'

import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'

/**
 * Form delivery options (pick one for a server route):
 *
 * 1. Slack Incoming Webhook (recommended) — POST from a Next.js Route Handler to a workspace
 *    webhook URL; messages land in #dunsy with no SMTP. Free, minimal setup, good for triage.
 *
 * 2. Resend / Postmark / SendGrid — transactional email APIs; send to szymon@dunsy.app from
 *    the server with a verified domain. Reliable, audit trail in inbox.
 *
 * 3. Google Workspace SMTP (Nodemailer) — app password + SMTP relay; works but more credential
 *    management and rate limits than dedicated email APIs.
 *
 * 4. Formspree / Getform — hosted form endpoints, no backend code; less control, third-party
 *    dependency.
 *
 * 5. Google Apps Script Web App — free HTTP endpoint that forwards to email or Slack; quick
 *    prototype but harder to version and monitor than a Route Handler.
 */
export type ContactFormValues = {
  name: string
  email: string
  message: string
}

const fieldClass =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

const labelClass = 'text-sm font-medium text-zinc-700 dark:text-zinc-300'

const panelClass =
  'rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40'

export const ContactForm = () => {
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = { ...values, submittedAt: new Date().toISOString() }
    console.log('[ContactForm]', payload)
    setSubmitted(true)
  }

  return (
    <section aria-label="Contact form">
      <form
        className={cn(panelClass, 'w-full space-y-4')}
        onSubmit={onSubmit}
      >
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="contact-name">Name</label>
          <Input
            className="w-full"
            id="contact-name"
            name="name"
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            required
            type="text"
            value={values.name}
            wrapperClassName="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="contact-email">Email</label>
          <Input
            className="w-full"
            id="contact-email"
            name="email"
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
            required
            type="email"
            value={values.email}
            wrapperClassName="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="contact-message">
            Message
          </label>
          <textarea
            className={cn(fieldClass, 'min-h-32 resize-y')}
            id="contact-message"
            name="message"
            onChange={(event) =>
              setValues((current) => ({ ...current, message: event.target.value }))
            }
            required
            rows={6}
            value={values.message}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button type="submit" variant="filled">
            Send message
          </Button>
          {submitted ? (
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">
              Logged to console (delivery not wired yet).
            </Text>
          ) : null}
        </div>
      </form>
    </section>
  )
}
