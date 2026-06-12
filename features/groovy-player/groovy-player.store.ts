import { create } from 'zustand'

type GroovyPlayerState = {
  input: string
  setInput: (value: string) => void
}

export const useGroovyPlayerStore = create<GroovyPlayerState>((set) => ({
  input: '',
  setInput: (value) => set({ input: value }),
}))
