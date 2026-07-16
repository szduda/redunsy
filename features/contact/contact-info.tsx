'use client'

import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

import { CONTACT_CHANNELS } from '@/features/contact/contact.constants'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'
import { Text } from '@/features/theme/text'

type ContactInfoVariant = 'compact' | 'section' | 'page'

type ContactInfoProps = {
  compact?: boolean
  section?: boolean
  className?: string
}

const resolveVariant = (props: ContactInfoProps): ContactInfoVariant => {
  if (props.compact) return 'compact'
  if (props.section) return 'section'
  return 'page'
}

const iconSizes: Record<ContactInfoVariant, string> = {
  compact: 'size-5',
  section: 'size-5',
  page: 'size-10',
}

const itemGap: Record<ContactInfoVariant, string> = {
  compact: 'gap-3',
  section: 'gap-3',
  page: 'gap-2',
}

const labelClass: Record<ContactInfoVariant, string> = {
  compact: '',
  section: 'text-sm font-medium text-zinc-700 dark:text-zinc-300',
  page: 'text-lg font-medium text-zinc-800 dark:text-zinc-200',
}

const pageItemClass = 'flex flex-col items-center gap-2 min-w-24'

const linkClass = 'group text-zinc-600 transition-colors dark:text-zinc-400'

const iconHoverClass =
  'shrink-0 text-zinc-500 transition-colors group-hover:text-yellowy dark:text-zinc-400 dark:group-hover:text-yellowy'

const labelHoverClass = 'transition-colors group-hover:text-yellowy'

type ChannelItemProps = {
  variant: ContactInfoVariant
  channel: (typeof CONTACT_CHANNELS)[number]
}

const ChannelItem = ({ variant, channel }: ChannelItemProps) => {
  const { Icon, label, href, external } = channel
  const isPage = variant === 'page'
  const content = (
    <>
      <Icon className={cn(iconSizes[variant], iconHoverClass)} />
      {variant !== 'compact' ? (
        <span className={cn(labelClass[variant], labelHoverClass)}>{label}</span>
      ) : null}
    </>
  )

  const itemClass = cn(
    KEYBOARD_FOCUS_VISIBLE_CLASS,
    'rounded-md',
    isPage ? pageItemClass : 'inline-flex items-center',
    !isPage && itemGap[variant],
    linkClass,
  )

  if (!href) {
    return (
      <span className={itemClass} title={variant === 'compact' ? label : undefined}>
        {content}
      </span>
    )
  }

  const linkProps: ComponentPropsWithoutRef<typeof Link> = {
    className: itemClass,
    href,
    title: variant === 'compact' ? label : undefined,
  }

  if (external) {
    return (
      <Link {...linkProps} rel="noreferrer" target="_blank">
        {content}
      </Link>
    )
  }

  return <Link {...linkProps}>{content}</Link>
}

export const ContactInfo = ({ compact, section, className }: ContactInfoProps) => {
  const variant = resolveVariant({ compact, section })

  if (variant === 'compact') {
    return (
      <nav aria-label="Contact" className={cn('flex flex-wrap items-center gap-4', className)}>
        {CONTACT_CHANNELS.map((channel) => (
          <ChannelItem key={channel.id} channel={channel} variant={variant} />
        ))}
      </nav>
    )
  }

  if (variant === 'section') {
    return (
      <section
        aria-labelledby="contact-info-heading"
        className={cn(
          'rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40',
          className,
        )}
      >
        <h2
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          id="contact-info-heading"
        >
          Get in touch
        </h2>
        <Text className="mt-1 text-pretty leading-relaxed">
          Questions, bug reports, and rhythm submissions are welcome.
        </Text>
        <div className="mt-4 flex flex-col gap-3">
          {CONTACT_CHANNELS.map((channel) => (
            <ChannelItem key={channel.id} channel={channel} variant={variant} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="contact-info-page-heading" className={cn('space-y-6', className)}>
      <h2
        className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        id="contact-info-page-heading"
      >
        Reach me directly
      </h2>
      <div className="flex flex-wrap items-start justify-between gap-8 sm:justify-start sm:gap-12">
        {CONTACT_CHANNELS.map((channel) => (
          <ChannelItem key={channel.id} channel={channel} variant={variant} />
        ))}
      </div>
    </section>
  )
}
