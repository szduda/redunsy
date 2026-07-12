import { type ReactNode } from 'react'

import { cn } from '@/features/theme/cn'

const KEYBOARD_HINT_TEXT_CLASS =
  'pointer-events-none absolute left-1/2 z-50 inline-block -translate-x-1/2 text-center text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400'

type KeyboardHintPosition = 'above' | 'below'

const positionClass: Record<KeyboardHintPosition, string> = {
  above: '-top-3 mb-0.5 leading-[0.8] backdrop-blur-lg',
  below: '-bottom-3 mb-0.5 leading-none backdrop-blur-lg',
}

type KeyboardHintTextProps = {
  position: KeyboardHintPosition
  className?: string
  children: ReactNode
}

const renderMultilineLabel = (text: string) => {
  const lines = text.split('\n')

  if (lines.length === 1) return text

  return lines.map((line, index) => (
    <span key={index} className="block leading-[0.8]">
      {line}
    </span>
  ))
}

export const KeyboardHintText = ({ position, className, children }: KeyboardHintTextProps) => (
  <span className={cn(KEYBOARD_HINT_TEXT_CLASS, positionClass[position], className)}>
    {position === 'above' && typeof children === 'string'
      ? renderMultilineLabel(children)
      : children}
  </span>
)
