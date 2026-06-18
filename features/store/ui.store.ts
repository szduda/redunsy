import { create } from 'zustand'

type UiState = {
  topNavSticky: boolean
  setTopNavSticky: (sticky: boolean) => void
  search: { term: string }
  setSearchTerm: (term: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  topNavSticky: false,
  setTopNavSticky: (topNavSticky) => set({ topNavSticky }),
  search: { term: '' },
  setSearchTerm: (term) => set({ search: { term } }),
}))
