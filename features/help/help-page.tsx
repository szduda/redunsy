'use client'

import { ContactInfo } from '@/features/contact/contact-info'
import { HELP_SECTIONS } from '@/features/help/help-sections'
import { HelpSectionBlock } from '@/features/help/help-section-block'
import { HelpContent } from '@/features/help/help-tile'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

const APP_VERSION = '0.1.0'

export const HelpPage = () => {
  useTopNavSticky(true)

  return (
    <div className="flex flex-1 flex-col">
      <HelpContent className="py-8 md:py-12">
        <header className="space-y-4 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Help</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            About dunsy.app
          </h1>
          <Text className="max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            This is an open-source project — you can access the code at the{' '}
            <Button
              className="text-black dark:text-white"
              link
              href="https://github.com/szduda/redunsy"
              targetBlank
            >
              GitHub repository
            </Button>
            . The core of this website — the GroovyPlayer — is built with{' '}
            <Button
              className="text-black dark:text-white"
              link
              href="https://github.com/surikov/midi-sounds-react"
              targetBlank
            >
              MIDISounds
            </Button>{' '}
            and{' '}
            <Button
              className="text-black dark:text-white"
              link
              href="https://github.com/surikov/webaudiofont"
              targetBlank
            >
              WebAudioFont
            </Button>{' '}
            OSS libraries.
          </Text>
          <Text className="max-w-2xl text-pretty leading-relaxed">
            This is currently a one-man project. If you would like to help build dunsy and you are
            familiar with web development —{' '}
            <Button link href="/contact">
              message me
            </Button>{' '}
            any time. If you want to contribute your drumming talents or whatever else from the
            muggle-in-the-software world — that would also be appreciated.
          </Text>
        </header>
      </HelpContent>

      <div className="flex flex-col">
        {HELP_SECTIONS.map((section) => (
          <HelpSectionBlock key={section.id} section={section} />
        ))}
      </div>

      <HelpContent className="mt-12 pb-12">
        <footer className="space-y-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <ContactInfo section />

          <section aria-labelledby="help-version">
            <h2
              className="text-sm font-semibold uppercase tracking-widest text-zinc-500"
              id="help-version"
            >
              App version
            </h2>
            <Text variant="mono" className="mt-1 text-zinc-700 dark:text-zinc-300">
              v{APP_VERSION}
            </Text>
          </section>
        </footer>
      </HelpContent>
    </div>
  )
}
