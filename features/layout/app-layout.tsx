'use client'

import { type ReactNode } from 'react'

import { BottomNav } from '@/features/layout/bottom-nav'

type AppLayoutProps = {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => (
  <>
    <div className="flex min-h-full flex-1 flex-col pb-16">{children}</div>
    <BottomNav />
  </>
)
