'use client'

import { createElement, type ReactNode } from 'react'

import { MidiSoundsProvider } from '@/lib/midinike/audio/provider'

import { ThemeProvider } from '@/features/theme/theme-provider'
import { ThemeScript } from '@/features/theme/theme-script'
import { useRhythmIndexSync } from '@/features/garage/use-rhythm-index-sync'

import { QueryProvider } from './query-provider'

const RhythmIndexSync = () => {
  useRhythmIndexSync()
  return null
}

type ProvidersProps = {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) =>
  createElement(
    QueryProvider,
    null,
    createElement(ThemeScript, null),
    createElement(
      ThemeProvider,
      null,
      createElement(MidiSoundsProvider, null, createElement(RhythmIndexSync, null), children),
    ),
  )
