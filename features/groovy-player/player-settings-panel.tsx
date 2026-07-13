'use client'

import { type ReactNode, useEffect } from 'react'

import { HelpIcon } from '@/features/icons/help-icon'
import { ScreenAwakeIcon } from '@/features/icons/screen-awake-icon'
import { FullBleedIcon } from '@/features/icons/full-bleed-icon'
import { ColumnsIcon } from '@/features/icons/columns-icon'
import { BarIndexIcon } from '@/features/icons/bar-index-icon'
import { PepperIcon } from '@/features/icons/pepper-icon'
import { TripletBracketIcon } from '@/features/icons/triplet-bracket-icon'
import { WarningIcon } from '@/features/icons/warning-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { SwingPatternField } from '@/features/groovy-player/swing-pattern-field'
import { isSwingPatternIncorrect, usePlayerStore } from '@/features/groovy-player/player.store'
import { BOTTOM_NAV_OFFSET_CLASS } from '@/features/layout/constants'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { Switch } from '@/features/theme/switch'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type PlayerSettingsPanelProps = {
  open: boolean
  onClose: () => void
}

type SettingRowProps = {
  icon: ReactNode
  children: ReactNode
}

const SettingRow = ({ icon, children }: SettingRowProps) => (
  <>
    <span className="flex size-5 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400 [&_svg]:size-5">
      {icon}
    </span>
    {children}
  </>
)

const BarsPerRowControl = () => {
  const isMobile = useIsMobile()
  const barsPerRow = usePlayerStore((state) =>
    isMobile ? state.mobileBarsPerRow : state.desktopBarsPerRow,
  )
  const nextBarsPerRow = usePlayerStore((state) =>
    isMobile ? state.nextMobileBarsPerRow : state.nextDesktopBarsPerRow,
  )
  const prevBarsPerRow = usePlayerStore((state) =>
    isMobile ? state.prevMobileBarsPerRow : state.prevDesktopBarsPerRow,
  )

  return (
    <SettingRow icon={<ColumnsIcon />}>
      <div className="flex items-center justify-between gap-3">
        <Text className="text-sm">Bars per row</Text>
        <div className="flex items-center gap-2">
          <IconButton
            aria-label="Fewer columns"
            circle
            className="!min-w-0 !px-2 !py-1 bg-zinc-200/40 dark:bg-zinc-800/40"
            onClick={prevBarsPerRow}
          >
            <span className="font-mono font-bold text-lg leading-none">−</span>
          </IconButton>
          <Text
            variant="mono"
            className="min-w-12 text-center text-sm font-bold !text-black dark:!text-white"
          >
            {barsPerRow} col{barsPerRow === 1 ? '' : 's'}
          </Text>
          <IconButton
            aria-label="More columns"
            circle
            className="!min-w-0 !px-2 !py-1 bg-zinc-200/40 dark:bg-zinc-800/40"
            onClick={nextBarsPerRow}
          >
            <span className="font-mono font-bold text-lg leading-none">+</span>
          </IconButton>
        </div>
      </div>
    </SettingRow>
  )
}

const SwingPatternSection = () => {
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingBarSize = usePlayerStore((state) => state.swingBarSize)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)
  const swingIncorrect = isSwingPatternIncorrect(swingPattern, swingBarSize)

  return (
    <SettingRow icon={<PepperIcon className="size-5 saturate-0" />}>
      <div className="flex justify-between">
        <div className="flex items-center gap-1.5">
          <Text className="text-sm font-medium">Swing pattern</Text>
          {swingIncorrect ? (
            <WarningIcon
              aria-label="Swing pattern length does not match bar size"
              className="size-3 text-yellowy"
            />
          ) : null}
        </div>
        <SwingPatternField
          barSize={swingBarSize}
          className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          onCommit={(value) => setSwingPattern(value, swingBarSize)}
          value={swingPattern}
        />
      </div>
    </SettingRow>
  )
}

export const PlayerSettingsPanel = ({ open, onClose }: PlayerSettingsPanelProps) => {
  const isMobile = useIsMobile()
  const showBarIndex = usePlayerStore((state) => state.showBarIndex)
  const markTriplets = usePlayerStore((state) => state.markTriplets)
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const preventScreenSleep = usePlayerStore((state) => state.preventScreenSleep)
  const setShowBarIndex = usePlayerStore((state) => state.setShowBarIndex)
  const setMarkTriplets = usePlayerStore((state) => state.setMarkTriplets)
  const setFullBleed = usePlayerStore((state) => state.setFullBleed)
  const setPreventScreenSleep = usePlayerStore((state) => state.setPreventScreenSleep)
  const showKeyboardHints = usePlayerStore((state) => state.showKeyboardHints)
  const setShowKeyboardHints = usePlayerStore((state) => state.setShowKeyboardHints)

  useEffect(() => {
    if (!open) return
    const onKeyDown = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const panelContent = (
    <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-4">
      <Text className="col-span-2 text-xs font-semibold tracking-widest uppercase opacity-40">
        Player settings
      </Text>
      <BarsPerRowControl />
      <SwingPatternSection />
      <SettingRow icon={<BarIndexIcon />}>
        <Switch checked={showBarIndex} label="Show bar index" onChange={setShowBarIndex} />
      </SettingRow>
      <SettingRow icon={<TripletBracketIcon />}>
        <Switch
          checked={markTriplets}
          label="Show subdivision brackets"
          onChange={setMarkTriplets}
        />
      </SettingRow>
      <SettingRow icon={<ScreenAwakeIcon />}>
        <Switch
          checked={preventScreenSleep}
          label="Prevent screen sleep"
          onChange={setPreventScreenSleep}
        />
      </SettingRow>
      {!isMobile ? (
        <SettingRow icon={<HelpIcon />}>
          <Switch checked={showKeyboardHints} label="Show hints" onChange={setShowKeyboardHints} />
        </SettingRow>
      ) : null}
      {!isMobile ? (
        <SettingRow icon={<FullBleedIcon />}>
          <Switch checked={fullBleed} label="Full bleed" onChange={setFullBleed} />
        </SettingRow>
      ) : null}
    </div>
  )

  return (
    <>
      <button
        aria-label="Close settings"
        className={cn('fixed inset-x-0 top-0 z-30 bg-black/40', BOTTOM_NAV_OFFSET_CLASS)}
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          isMobile
            ? cn(
                'fixed inset-x-0 z-40 max-h-[calc(100dvh-7.5rem)] overflow-y-auto border-t',
                BOTTOM_NAV_OFFSET_CLASS,
                'border-zinc-200 bg-background p-5 dark:border-zinc-800',
              )
            : cn(
                'fixed right-0 z-40 w-80 max-h-[calc(100dvh-5rem)] overflow-y-auto',
                BOTTOM_NAV_OFFSET_CLASS,
                'border border-b-0 border-zinc-200 bg-background p-6 dark:border-zinc-800',
                'rounded-tl-xl',
              ),
        )}
        role="dialog"
        aria-modal
        aria-label="Player settings"
      >
        {panelContent}
      </div>
    </>
  )
}
