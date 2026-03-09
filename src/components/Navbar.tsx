'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { languages, LangCode, Translations } from '@/lib/i18n'

export function Navbar({ onLangChange }: { onLangChange?: (t: Translations) => void }) {
  const { data: session } = useSession()
  const [lang, setLang] = useState<LangCode>('en')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('lang') as LangCode | null
    if (stored && languages[stored]) {
      setLang(stored)
      onLangChange?.(languages[stored])
    }
  }, [onLangChange])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectLang(code: LangCode) {
    setLang(code)
    localStorage.setItem('lang', code)
    onLangChange?.(languages[code])
    setOpen(false)
  }

  const t = languages[lang].nav

  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-white font-bold text-2xl flex items-center gap-1">
          <span className="text-pink-500">🔥</span> tinder
        </Link>
        <nav className="hidden md:flex gap-6 text-white/80 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">{t.products}</a>
          <a href="#" className="hover:text-white transition-colors">{t.about}</a>
          <a href="#" className="hover:text-white transition-colors">{t.safety}</a>
          <a href="#" className="hover:text-white transition-colors">{t.support}</a>
          <a href="#" className="hover:text-white transition-colors">{t.download}</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Language switcher */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="text-white/80 text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            🌐 {languages[lang].label}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 min-w-[140px]">
              {(Object.keys(languages) as LangCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => selectLang(code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    lang === code
                      ? 'text-pink-400 bg-white/5'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {languages[code].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {session ? (
          <button
            onClick={() => signOut()}
            className="border border-white text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white hover:text-black transition-colors"
          >
            Log out
          </button>
        ) : (
          <Link
            href="/login"
            className="border border-white text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white hover:text-black transition-colors"
          >
            {t.login}
          </Link>
        )}
      </div>
    </header>
  )
}
