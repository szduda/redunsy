'use client'

import { ChevronDownIcon } from '@/features/icons/chevron-down-icon'
import { cn } from '@/features/theme/cn'
import { Text } from '@/features/theme/text'

const STEPS = [
  { step: 1 as const, label: 'Rhythm info' },
  { step: 2 as const, label: 'Layers' },
  { step: 3 as const, label: 'Ready' },
]

type CreatorStepMonitorProps = {
  currentStep: 1 | 2 | 3
  compact?: boolean
  onStepSelect?: (step: 1 | 2 | 3) => void
}

const stepCircleClass = (active: boolean, completed: boolean, isCompact: boolean, clickable: boolean) =>
  cn(
    'flex shrink-0 items-center justify-center rounded-full border font-semibold transition-colors',
    isCompact ? 'size-6 text-[10px]' : 'size-7 text-xs',
    clickable && 'cursor-pointer hover:border-zinc-500 dark:hover:border-zinc-400',
    completed
      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
      : active
        ? 'border-zinc-900 bg-zinc-50 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100'
        : 'border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500',
  )

const stepArrowClass = (completed: boolean) =>
  cn(
    'size-3 shrink-0 -rotate-90',
    completed ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600',
  )

export const CreatorStepMonitor = ({
  currentStep,
  compact = false,
  onStepSelect,
}: CreatorStepMonitorProps) => (
  <nav aria-label="Creator steps" className={cn(compact ? 'min-w-0' : 'w-full')}>
    <ol className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
      {STEPS.map(({ step, label }, index) => {
        const active = currentStep === step
        const completed = currentStep > step
        const isLast = index === STEPS.length - 1
        const circleClass = stepCircleClass(active, completed, compact, Boolean(onStepSelect))

        return (
          <li key={step} className="flex items-center gap-1">
            <div className="flex min-w-0 items-center gap-1.5">
              {onStepSelect ? (
                <button
                  aria-current={active ? 'step' : undefined}
                  aria-label={`Go to step ${step}: ${label}`}
                  className={circleClass}
                  onClick={() => onStepSelect(step)}
                  type="button"
                >
                  {step}
                </button>
              ) : (
                <span className={circleClass}>{step}</span>
              )}
              {!compact ? (
                <Text
                  className={cn(
                    '!text-xs sm:!text-sm',
                    active || completed
                      ? '!text-zinc-800 dark:!text-zinc-200'
                      : '!text-zinc-400 dark:!text-zinc-500',
                  )}
                >
                  <span className="truncate">{label}</span>
                </Text>
              ) : (
                <Text
                  className={cn(
                    'hidden !text-xs sm:inline',
                    active || completed
                      ? '!text-zinc-800 dark:!text-zinc-200'
                      : '!text-zinc-400 dark:!text-zinc-500',
                  )}
                >
                  <span className="truncate">{label}</span>
                </Text>
              )}
            </div>
            {!isLast ? <ChevronDownIcon className={stepArrowClass(completed)} /> : null}
          </li>
        )
      })}
    </ol>
  </nav>
)
