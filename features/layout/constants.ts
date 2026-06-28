export const PAGE_BODY_BG_CLASS = 'bg-white dark:bg-zinc-950'

/** Reserved height for the fixed top nav — keep layout padding aligned when sticky. */
export const TOP_NAV_HEIGHT_CLASS = 'h-10'
export const TOP_NAV_PADDING_CLASS = 'pt-10'
export const TOP_NAV_BG_CLASS = 'bg-black/95'
export const TOP_NAV_HALO_STROKE_CLASS = 'stroke-zinc-900/95'

/** Sticky offset and viewport height below the fixed top nav (2.5rem = h-10). */
export const TOP_NAV_STICKY_TOP_CLASS = 'top-10'
export const TOP_NAV_VIEWPORT_HEIGHT_CLASS = 'h-[calc(100dvh-2.5rem)]'
export const TOP_NAV_VIEWPORT_MAX_HEIGHT_CLASS = 'max-h-[calc(100dvh-2.5rem)]'
export const TOP_NAV_STICKY_SIDEBAR_LG_CLASS = 'lg:top-10 lg:h-[calc(100dvh-2.5rem)]'

/** Sticky garage toolbar below the fixed top nav on mobile. */
export const GARAGE_MOBILE_TOOLBAR_STICKY_CLASS =
  'sticky top-10 z-10 -mx-3 flex flex-col gap-3 border-b border-zinc-200 bg-white px-3 pt-6 pb-3 dark:border-zinc-800 dark:bg-zinc-950 md:-mx-4 md:px-4 lg:hidden'

/** Reserved height for the fixed bottom nav — keep layout padding and overlays aligned. */
export const BOTTOM_NAV_HEIGHT_CLASS = 'h-16 lg:h-20'
export const BOTTOM_NAV_OFFSET_CLASS = 'bottom-16 lg:bottom-20'
export const BOTTOM_NAV_PADDING_CLASS = 'pb-16 lg:pb-20'
