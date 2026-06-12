'use client'

import { createElement, type ReactNode } from 'react'

import { QueryProvider } from './query-provider'

type ProvidersProps = {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) =>
  createElement(QueryProvider, null, children)
