'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { languages, LangCode, Translations } from '@/lib/i18n'

function getInitialLang(): LangCode {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('lang') as LangCode | null
  return stored && languages[stored] ? stored : 'en'
}

export function Navbar({ onLangChange }: { onLangChange?: (t: Translations) => void }) {
  const { data: session } = useSession()
  const [lang, setLang] = useState<LangCode>(getInitialLang)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onLangChange?.(languages[lang])
  }, [lang, onLangChange])

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
    <>
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-white font-bold text-2xl flex items-center gap-1">
            <span className="text-pink-500">🔥</span> tinder
          </Link>
          <nav className="hidden md:flex gap-6 text-white/80 text-sm font-medium">
            <Link href="/" className="hover:text-white transition-colors">{t.products}</Link>
            <Link href="/about" className="hover:text-white transition-colors">{t.about}</Link>
            <Link href="/safety" className="hover:text-white transition-colors">{t.safety}</Link>
            <Link href="/support" className="hover:text-white transition-colors">{t.support}</Link>
            <Link href="/download" className="hover:text-white transition-colors">{t.download}</Link>
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
              <div className="absolute right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 min-w-35">
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
              {t.logout}
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

      <nav className="md:hidden relative z-10 px-6 pb-3 flex flex-wrap gap-4 text-white/75 text-sm font-medium">
        <Link href="/" className="hover:text-white transition-colors">{t.products}</Link>
        <Link href="/about" className="hover:text-white transition-colors">{t.about}</Link>
        <Link href="/safety" className="hover:text-white transition-colors">{t.safety}</Link>
        <Link href="/support" className="hover:text-white transition-colors">{t.support}</Link>
        <Link href="/download" className="hover:text-white transition-colors">{t.download}</Link>
      </nav>
    </>
  )
}
