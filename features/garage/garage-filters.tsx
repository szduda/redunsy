'use client'

import { GarageFiltersDesktop, GarageFiltersMobile } from '@/features/garage/garage-filters-mobile'
import { useGarageFilterSections } from '@/features/garage/garage-filter-sections'

export const GarageFilters = () => {
  const sections = useGarageFilterSections()

  return (
    <>
      <GarageFiltersMobile sections={sections} />
      <GarageFiltersDesktop sections={sections} />
    </>
  )
}
