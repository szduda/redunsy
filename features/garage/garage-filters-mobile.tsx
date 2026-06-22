'use client'

import { useEffect, useState } from 'react'

import { GarageFilterChipList, GarageFilterSection } from '@/features/garage/garage-filter-section'
import type {
  GarageFilterSection as GarageFilterSectionData,
  GarageFilterSectionId,
} from '@/features/garage/garage-filter-sections'
import { AfricaIcon } from '@/features/icons/africa-icon'
import { DjembeIcon } from '@/features/icons/djembe-icon'
import { MetronomeIcon } from '@/features/icons/metronome-icon'
import { TagIcon } from '@/features/icons/tag-icon'
import { UserIcon } from '@/features/icons/user-icon'
import type { Icon } from '@/features/icons/types'
import { GarageOwnershipFilterMobile } from '@/features/garage/garage-ownership-filter'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'

const SECTION_ICONS: Record<GarageFilterSectionId, Icon> = {
  meter: MetronomeIcon,
  instruments: DjembeIcon,
  artist: UserIcon,
  origin: AfricaIcon,
  rhythmGroup: TagIcon,
  tags: TagIcon,
}

const SECTION_ICON_CLASS: Partial<Record<GarageFilterSectionId, string>> = {
  meter: 'text-redy',
  artist: 'text-greeny',
  origin: 'text-yellowy',
  rhythmGroup: 'text-greeny',
  tags: 'text-redy',
}

type GarageFiltersMobileProps = {
  sections: GarageFilterSectionData[]
}

export const GarageFiltersMobile = ({ sections }: GarageFiltersMobileProps) => {
  const [openSection, setOpenSection] = useState<GarageFilterSectionId | null>(null)

  useEffect(() => {
    if (openSection && !sections.some((section) => section.id === openSection)) {
      setOpenSection(null)
    }
  }, [openSection, sections])

  const toggleSection = (id: GarageFilterSectionId) => {
    setOpenSection((current) => (current === id ? null : id))
  }

  const activeSection = sections.find((section) => section.id === openSection)

  return (
    <div className="flex flex-col gap-2 lg:hidden">
      <div className="flex items-center gap-1">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.id]
            const isOpen = openSection === section.id
            const activeCount = section.selected.length
            const hasActive = activeCount > 0

            return (
              <Button
                key={section.id}
                aria-expanded={isOpen}
                aria-label={hasActive ? `${section.title}, ${activeCount} active` : section.title}
                className={cn(
                  'relative size-10 shrink-0 rounded-full',
                  isOpen && 'bg-zinc-100 dark:bg-zinc-800/80',
                  hasActive && 'text-zinc-900 dark:text-zinc-100',
                )}
                onClick={() => toggleSection(section.id)}
                variant="subtle"
              >
                <span
                  className={cn(
                    'inline-flex size-5 items-center justify-center',
                    SECTION_ICON_CLASS[section.id],
                  )}
                >
                  <Icon />
                </span>
                {hasActive ? (
                  <span
                    aria-hidden
                    className="absolute top-0.5 right-0.5 flex size-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-900/50 text-[9px] leading-none font-medium text-white dark:bg-white/50 dark:text-zinc-900"
                  >
                    {activeCount}
                  </span>
                ) : null}
              </Button>
            )
          })}
        </div>
        <GarageOwnershipFilterMobile />
      </div>

      {activeSection ? (
        <div className="flex flex-col gap-1.5 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
            {activeSection.title}
          </span>
          <GarageFilterChipList
            formatLabel={activeSection.formatLabel}
            selected={activeSection.selected}
            values={activeSection.values}
            onToggle={activeSection.onToggle}
          />
        </div>
      ) : null}
    </div>
  )
}

type GarageFiltersDesktopProps = {
  sections: GarageFilterSectionData[]
}

export const GarageFiltersDesktop = ({ sections }: GarageFiltersDesktopProps) => (
  <div className="hidden flex-col gap-5 lg:flex">
    {sections.map((section) => (
      <GarageFilterSection key={section.id} title={section.title}>
        <GarageFilterChipList
          formatLabel={section.formatLabel}
          selected={section.selected}
          values={section.values}
          onToggle={section.onToggle}
        />
      </GarageFilterSection>
    ))}
  </div>
)
