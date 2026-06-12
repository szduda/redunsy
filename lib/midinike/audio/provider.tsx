'use client'

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'

import { SAMPLE_IDS } from './drums-config'
import { createMidiPlayer } from './player'

import type { MidiPlayer } from '../types'

const MidiSoundsContext = createContext<RefObject<MidiPlayer | null> | null>(null)

export const useMidiSounds = () => {
  const ref = useContext(MidiSoundsContext)
  if (!ref) throw new Error('useMidiSounds must be used within MidiSoundsProvider')
  return ref
}

export const MidiSoundsProvider = ({ children }: { children: ReactNode }) => {
  const midiSounds = useRef<MidiPlayer | null>(null)

  useEffect(() => {
    midiSounds.current = createMidiPlayer(SAMPLE_IDS)
    return () => midiSounds.current?.stopPlayLoop()
  }, [])

  return createElement(MidiSoundsContext.Provider, { value: midiSounds }, children)
}
