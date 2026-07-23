'use client'

import { useState } from 'react'

import { LearnShell } from '@/features/learn/learn-shell'
import { SWING_ARTICLE_EN } from '@/features/learn/swing/swing-article.en'
import { SWING_ARTICLE_PL } from '@/features/learn/swing/swing-article.pl'
import type { SwingLocale } from '@/features/learn/swing/swing-article.types'
import { SwingArticleBody } from '@/features/learn/swing/swing-article-body'
import { SwingLanguagePanel } from '@/features/learn/swing/swing-language-panel'

const COPY = {
  en: SWING_ARTICLE_EN,
  pl: SWING_ARTICLE_PL,
} as const

export const SwingArticlePage = () => {
  const [locale, setLocale] = useState<SwingLocale>('en')
  const copy = COPY[locale]

  return (
    <LearnShell className="space-y-8">
      <SwingLanguagePanel
        action={copy.languagePanel.action}
        message={copy.languagePanel.message}
        onSwitch={setLocale}
        targetLocale={copy.languagePanel.targetLocale}
      />
      <SwingArticleBody copy={copy} />
    </LearnShell>
  )
}
