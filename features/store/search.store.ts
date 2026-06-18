import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createUrlQueryStorage } from '@/features/store/url-query-storage'

export const SEARCH_QUERY_PARAM = 'search'

type SearchState = {
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  clearSearchTerm: () => void
}

const normalizeSearchTerm = (searchTerm: string) => searchTerm.trim()

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchTerm: '',
      setSearchTerm: (searchTerm) => set({ searchTerm: normalizeSearchTerm(searchTerm) }),
      clearSearchTerm: () => set({ searchTerm: '' }),
    }),
    {
      name: 'redunsy-search',
      storage: createJSONStorage(() =>
        createUrlQueryStorage({ param: SEARCH_QUERY_PARAM, field: 'searchTerm' }),
      ),
      partialize: (state) => ({ searchTerm: state.searchTerm }),
      skipHydration: true,
    },
  ),
)
