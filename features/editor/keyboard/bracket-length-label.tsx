import { NoteBracketIcon } from '@/features/icons/note-bracket-icon'
import { cn } from '@/features/theme/cn'

type BracketLengthLabelProps = {
  label: string
  className?: string
}

export const BracketLengthLabel = ({ label, className }: BracketLengthLabelProps) => (
  <span className={cn('flex flex-col items-center justify-center gap-0.5', className)}>
    <span
      className={cn(
        'font-mono font-bold leading-none tracking-tight',
        label.includes(':') ? 'text-[10px]' : 'text-[11px]',
      )}
    >
      {label}
    </span>
    <NoteBracketIcon className="size-4" />
  </span>
)
