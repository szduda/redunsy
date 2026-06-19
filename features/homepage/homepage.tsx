'use client'

import { HomepageDesktop } from '@/features/homepage/homepage-desktop'
import { HomepageMobile } from '@/features/homepage/homepage-mobile'

export const Homepage = () => (
  <>
    <HomepageMobile />
    <HomepageDesktop />
  </>
)
