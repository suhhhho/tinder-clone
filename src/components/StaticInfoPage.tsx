'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { languages, LangCode, Translations } from '@/lib/i18n'

type PageKey = 'about' | 'safety' | 'support' | 'download'

export function StaticInfoPage({ pageKey }: { pageKey: PageKey }) {
  const [t, setT] = useState<Translations>(() => {
    if (typeof window === 'undefined') return languages.en
    const stored = localStorage.getItem('lang') as LangCode | null
    return stored && languages[stored] ? languages[stored] : languages.en
  })
  const handleLangChange = useCallback((next: Translations) => setT(next), [])

  const page = t.pages[pageKey]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onLangChange={handleLangChange} />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">{page.title}</h1>
        <p className="mt-6 text-white/70 text-lg leading-relaxed">{page.body}</p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block bg-linear-to-r from-pink-500 to-orange-400 text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            {t.nav.products}
          </Link>
        </div>
      </main>
    </div>
  )
}
