import { NoteBracketIcon } from '@/features/icons/note-bracket-icon'
import { cn } from '@/features/theme/cn'

type BracketLengthLabelProps = {
  label: string
  className?: string
}

export const BracketLengthLabel = ({ label, className }: BracketLengthLabelProps) => (
  <span className={cn('flex flex-col items-center justify-center gap-0', className)}>
    <span className="translate-y-1 font-mono text-[10px] font-bold leading-none tracking-tight">
      {label}
    </span>
    <NoteBracketIcon className="size-4" />
  </span>
)
