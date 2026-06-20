import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppLayout } from '@/features/layout/app-layout'
import { Providers } from '@/features/shared/providers'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Redunsy',
  description: 'Groovy player on re.dunsy.app',
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    suppressHydrationWarning
  >
    <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Providers>
        <AppLayout>{children}</AppLayout>
      </Providers>
    </body>
  </html>
)

export default RootLayout
