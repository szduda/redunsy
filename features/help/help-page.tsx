'use client'

import { HELP_SECTIONS } from '@/features/help/help-sections'
import { HelpSectionBlock } from '@/features/help/help-section-block'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

const APP_VERSION = '0.1.0'

export const HelpPage = () => {
  useTopNavSticky(true)

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6 md:py-12">
      <header className="mb-10 space-y-4 border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Help</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          About re.dunsy.app
        </h1>
        <Text className="max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          Redunsy is the rebuilt home of the dunsy groove library — sheet music for djembe and
          dundun with an integrated audio player. The GroovyPlayer engine uses{' '}
          <Button link href="https://github.com/surikov/MidiSounds" targetBlank>
            MIDISounds
          </Button>{' '}
          and{' '}
          <Button link href="https://github.com/surikov/webaudiofont" targetBlank>
            WebAudioFont
          </Button>{' '}
          for realistic percussion samples. Browse traditional and modern phrases from West Africa,
          play along, or write your own in the Rhythm Editor.
        </Text>
        <Text className="max-w-2xl text-pretty leading-relaxed">
          This is an open-source continuation of{' '}
          <Button link href="https://dunsy.app" targetBlank>
            dunsy.app
          </Button>
          . If you spot something wrong or want to contribute — code, rhythms, or feedback —{' '}
          <Button link href="mailto:szymon@dunsy.app">
            get in touch
          </Button>
          .
        </Text>
      </header>

      <div className="flex flex-col gap-12">
        {HELP_SECTIONS.map((section) => (
          <HelpSectionBlock key={section.id} section={section} />
        ))}
      </div>

      <footer className="mt-12 space-y-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <section aria-labelledby="help-contact">
          <h2
            className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
            id="help-contact"
          >
            Need more help?
          </h2>
          <Text className="mt-2 max-w-2xl text-pretty leading-relaxed">
            Questions, bug reports, and rhythm submissions are welcome.{' '}
            <Button link href="mailto:szymon@dunsy.app">
              Send a message
            </Button>{' '}
            and include the rhythm link or a short screen recording if something looks off.
          </Text>
        </section>

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
    </div>
  )
}
