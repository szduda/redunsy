import { create } from 'zustand'

export const PAGE_SIZE_OPTIONS = [10, 20, 30] as const
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number]

/** My Rhythms views hide pagination when the library is smaller than one default page. */
export const MY_RHYTHMS_PAGINATION_THRESHOLD = 20

type PaginationState = {
  page: number
  setPage: (page: number) => void
  pageSize: PageSizeOption
  setPageSize: (pageSize: PageSizeOption) => void
}

/** Active garage results page. Synced to the `page` URL param by SearchUrlSync. */
export const usePaginationStore = create<PaginationState>((set) => ({
  page: 1,
  setPage: (page) => set({ page: Math.max(1, Math.trunc(page)) }),
  pageSize: 20,
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}))
