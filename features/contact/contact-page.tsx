'use client'

import { ContactForm } from '@/features/contact/contact-form'
import { ContactInfo } from '@/features/contact/contact-info'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import { Text } from '@/features/theme/text'

export const ContactPage = () => {
  useTopNavSticky(true)

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6 md:py-12">
      <header className="mb-10 space-y-4 border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Contact</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Contact dunsy.app
        </h1>
        <Text className="max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          dunsy is a one-person project. Whether you want to report a bug, suggest a rhythm, or talk
          about contributing code — pick a channel below or use the form.
        </Text>
        <Text className="max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          Use the form for feedback, bug reports, or rhythm submissions. Include a rhythm link or
          short screen recording when something looks wrong.
        </Text>
      </header>

      <div className="flex flex-col gap-12">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  )
}
