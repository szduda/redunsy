import { create } from 'zustand'

type UiState = {
  topNavSticky: boolean
  setTopNavSticky: (sticky: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  topNavSticky: false,
  setTopNavSticky: (topNavSticky) => set({ topNavSticky }),
}))
