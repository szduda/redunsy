'use client'

import { Logo } from '@/features/logo/logo'

type AppLogoProps = {
  className?: string
}

export const AppLogo = ({ className }: AppLogoProps) => (
  <Logo className={className} compact href="/" />
)
