'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode, useState } from 'react'

type QueryProviderProps = {
  children: ReactNode
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [client] = useState(() => new QueryClient())

  return createElement(QueryClientProvider, { client }, children)
}
