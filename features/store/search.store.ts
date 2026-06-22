import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { searchUrlStorage } from '@/features/store/search-url-storage'

export const SEARCH_QUERY_PARAM = 'search'

type SearchState = {
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  clearSearchTerm: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchTerm: '',
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      clearSearchTerm: () => set({ searchTerm: '' }),
    }),
    {
      name: 'redunsy-search',
      storage: createJSONStorage(() => searchUrlStorage),
      partialize: (state) => ({ searchTerm: state.searchTerm }),
      skipHydration: true,
    },
  ),
)
