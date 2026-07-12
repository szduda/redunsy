import { AfricaIcon } from '@/features/icons/africa-icon'
import { BarIndexIcon } from '@/features/icons/bar-index-icon'
import { ChevronDownIcon } from '@/features/icons/chevron-down-icon'
import { ColumnsIcon } from '@/features/icons/columns-icon'
import { DjembeIcon } from '@/features/icons/djembe-icon'
import { EditIcon } from '@/features/icons/edit-icon'
import { ForkIcon } from '@/features/icons/fork-icon'
import { FullBleedIcon } from '@/features/icons/full-bleed-icon'
import { MetronomeIcon } from '@/features/icons/metronome-icon'
import { Note16Icon } from '@/features/icons/note-16-icon'
import { PauseIcon } from '@/features/icons/pause-icon'
import { PepperIcon } from '@/features/icons/pepper-icon'
import { PlayIcon } from '@/features/icons/play-icon'
import { RestartIcon } from '@/features/icons/restart-icon'
import { ScreenAwakeIcon } from '@/features/icons/screen-awake-icon'
import { SearchIcon } from '@/features/icons/search-icon'
import { SettingsIcon } from '@/features/icons/settings-icon'
import { ShekereIcon } from '@/features/icons/shekere-icon'
import { SpeakerIcon } from '@/features/icons/speaker-icon'
import { StopIcon } from '@/features/icons/stop-icon'
import { TagIcon } from '@/features/icons/tag-icon'
import type { Icon, IconProps } from '@/features/icons/types'
import { PolyrhythmBracketIcon } from '@/features/icons/polyrhythm-bracket-icon'
import { TripletBracketIcon } from '@/features/icons/triplet-bracket-icon'
import { UserIcon } from '@/features/icons/user-icon'
import type { HelpIconKey } from '@/features/help/help.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

export const HELP_ICON_CLASS = 'shrink-0 size-16 lg:size-24 text-zinc-500 dark:text-zinc-400'

const helpIconClass = (className?: string, fixedClass?: string) =>
  cn(HELP_ICON_CLASS, fixedClass, className)

const iconRenderer = (IconComponent: Icon, fixedClass?: string): Icon => {
  const HelpIcon = ({ className, ...props }: IconProps) => (
    <IconComponent className={helpIconClass(className, fixedClass)} {...props} />
  )
  return HelpIcon
}

const HELP_ICON_RENDERERS: Record<HelpIconKey, Icon> = {
  search: iconRenderer(SearchIcon),
  tag: iconRenderer(TagIcon, 'text-redy'),
  user: iconRenderer(UserIcon),
  artist: iconRenderer(UserIcon, 'text-greeny'),
  edit: iconRenderer(EditIcon),
  fork: iconRenderer(ForkIcon),
  play: iconRenderer(PlayIcon),
  pause: iconRenderer(PauseIcon),
  stop: iconRenderer(StopIcon),
  restart: iconRenderer(RestartIcon),
  tempo: ({ className }) => (
    <Text
      variant="mono"
      className={cn(
        'flex size-16 shrink-0 items-center justify-center text-lg font-black uppercase tracking-tight !text-zinc-500 lg:size-24 lg:text-2xl dark:!text-zinc-400',
        className,
      )}
    >
      bpm
    </Text>
  ),
  djembe: iconRenderer(DjembeIcon, 'scale-125'),
  shekere: ({ className, ...props }) => (
    <ShekereIcon
      className={cn('size-20 shrink-0 lg:size-28', helpIconClass(className))}
      {...props}
    />
  ),
  pepper: ({ className, ...props }) => (
    <PepperIcon className={cn('size-20 shrink-0 text-yellowy lg:size-28', className)} {...props} />
  ),
  speaker: iconRenderer(SpeakerIcon),
  collapse: iconRenderer(ChevronDownIcon),
  settings: iconRenderer(SettingsIcon),
  note16: iconRenderer(Note16Icon),
  barIndex: iconRenderer(BarIndexIcon),
  triplet: iconRenderer(TripletBracketIcon),
  polyrhythm: iconRenderer(PolyrhythmBracketIcon),
  screenAwake: iconRenderer(ScreenAwakeIcon),
  fullBleed: iconRenderer(FullBleedIcon),
  columns: iconRenderer(ColumnsIcon),
  meter: iconRenderer(MetronomeIcon, 'text-redy'),
  instruments: iconRenderer(DjembeIcon),
  origin: iconRenderer(AfricaIcon, 'text-yellowy'),
}

type HelpTopicIconProps = IconProps & {
  icon?: HelpIconKey
}

export const HelpTopicIcon = ({ icon, className, ...props }: HelpTopicIconProps) => {
  if (!icon) return <span aria-hidden className="size-16 lg:size-24" />

  const IconComponent = HELP_ICON_RENDERERS[icon]

  return (
    <span className="flex items-center justify-center">
      <IconComponent className={className} {...props} />
    </span>
  )
}

export const HelpTopicIcons = ({
  icons,
  className,
}: {
  icons: HelpIconKey[]
  className?: string
}) => (
  <div className={cn('flex flex-wrap items-center justify-center gap-3', className)}>
    {icons.map((icon) => (
      <HelpTopicIcon key={icon} icon={icon} className={icons.length > 1 ? '!size-8' : undefined} />
    ))}
  </div>
)
