'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { languages, Translations } from '@/lib/i18n'

type Photo = { id: string; url: string; order: number }
type Profile = { bio: string | null; age: number | null; photos: Photo[] }
type MatchUser = { id: string; name: string | null; profile: Profile | null }

// ─── Logged-in dashboard ────────────────────────────────────────────────────
function LoggedInHome({ userName }: { userName: string }) {
  const router = useRouter()
  const [matches, setMatches] = useState<MatchUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/matches', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <span className="text-white font-black text-2xl">🔥 tinder</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/onboarding?edit=true')}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Profile
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Log out
          </button>
          <button
            onClick={() => router.push('/swipe')}
            className="bg-linear-to-r from-pink-500 to-orange-400 text-white font-bold text-sm px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Start Swiping →
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        {/* Greeting */}
        <h1 className="text-white font-black text-3xl mb-1">
          Hey, {userName.split(' ')[0]} 👋
        </h1>
        <p className="text-white/40 text-sm mb-8">Here&apos;s who liked you back.</p>

        {/* Matches section */}
        <section>
          <h2 className="text-white font-bold text-lg mb-4">
            Matches
            {!loading && (
              <span className="ml-2 text-pink-400 text-sm font-semibold">
                {matches.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-full bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-zinc-900 rounded-2xl p-8 text-center border border-white/5">
              <div className="text-5xl mb-3">💤</div>
              <p className="text-white/60 text-sm">No matches yet — start swiping!</p>
              <button
                onClick={() => router.push('/swipe')}
                className="mt-4 bg-linear-to-r from-pink-500 to-orange-400 text-white font-bold text-sm px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Go Swipe
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {matches.map((m) => {
                const photo = m.profile?.photos?.[0]?.url
                return (
                  <button
                    key={m.id}
                    onClick={() => router.push(`/chat/${m.id}`)}
                    className="flex flex-col items-center gap-1 w-20 group"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 shrink-0 group-hover:border-pink-400 transition-colors">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt={m.name ?? ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl">👤</div>
                      )}
                    </div>
                    <span className="text-white/70 text-xs text-center truncate w-full group-hover:text-white transition-colors">
                      {m.name?.split(' ')[0] ?? 'Unknown'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="mt-10 grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/swipe')}
            className="bg-zinc-900 border border-white/5 rounded-2xl p-5 text-left hover:border-pink-500/30 transition-colors"
          >
            <div className="text-3xl mb-2">🔥</div>
            <p className="text-white font-semibold text-sm">Discover</p>
            <p className="text-white/40 text-xs mt-1">Swipe on new people</p>
          </button>
          <button
            onClick={() => router.push('/onboarding?edit=true')}
            className="bg-zinc-900 border border-white/5 rounded-2xl p-5 text-left hover:border-pink-500/30 transition-colors"
          >
            <div className="text-3xl mb-2">✏️</div>
            <p className="text-white font-semibold text-sm">Edit Profile</p>
            <p className="text-white/40 text-xs mt-1">Update your info &amp; photos</p>
          </button>
        </section>
      </main>
    </div>
  )
}

// ─── Marketing / landing page assets ────────────────────────────────────────
const profiles = [
  { name: "Emma",      age: 24, photo: "women/1" },
  { name: "Liam",      age: 26, photo: "men/1" },
  { name: "Olivia",    age: 22, photo: "women/4" },
  { name: "Noah",      age: 28, photo: "men/3" },
  { name: "Ava",       age: 21, photo: "women/8" },
  { name: "Elijah",    age: 25, photo: "men/6" },
  { name: "Sophia",    age: 23, photo: "women/10" },
  { name: "James",     age: 27, photo: "men/9" },
  { name: "Isabella",  age: 22, photo: "women/13" },
  { name: "Lucas",     age: 29, photo: "men/11" },
  { name: "Mia",       age: 20, photo: "women/16" },
  { name: "Ethan",     age: 24, photo: "men/14" },
  { name: "Charlotte", age: 26, photo: "women/18" },
  { name: "Mason",     age: 23, photo: "men/17" },
  { name: "Amelia",    age: 21, photo: "women/21" },
  { name: "Logan",     age: 30, photo: "men/19" },
  { name: "Harper",    age: 22, photo: "women/24" },
  { name: "Jackson",   age: 25, photo: "men/22" },
  { name: "Evelyn",    age: 23, photo: "women/26" },
  { name: "Sebastian", age: 28, photo: "men/25" },
  { name: "Grace",     age: 20, photo: "women/30" },
  { name: "Henry",     age: 27, photo: "men/28" },
  { name: "Lily",      age: 24, photo: "women/33" },
  { name: "Owen",      age: 26, photo: "men/31" },
  { name: "Zoey",      age: 21, photo: "women/36" },
  { name: "Carter",    age: 29, photo: "men/34" },
  { name: "Nora",      age: 22, photo: "women/39" },
  { name: "Wyatt",     age: 24, photo: "men/37" },
  { name: "Riley",     age: 23, photo: "women/42" },
  { name: "Dylan",     age: 25, photo: "men/40" },
  { name: "Stella",    age: 20, photo: "women/45" },
  { name: "Grayson",   age: 28, photo: "men/43" },
]

function PhoneCard({ name, age, photo }: { name: string; age: number; photo: string }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://randomuser.me/api/portraits/${photo}.jpg`}
        alt={name}
        className="w-full h-64 object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
        <p className="text-white font-semibold text-sm">{name} {age}</p>
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 px-2">
        <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow text-red-500 text-xs font-bold">✕</span>
        <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow text-pink-500 text-xs">♥</span>
      </div>
    </div>
  )
}

// ─── Root component ──────────────────────────────────────────────────────────
export default function Home() {
  const { data: session, status } = useSession()
  const [t, setT] = useState<Translations>(() => {
    if (typeof window === 'undefined') return languages.en
    const stored = localStorage.getItem('lang') as LangCode | null
    return (stored && languages[stored]) ? languages[stored] : languages.en
  })
  const handleLangChange = useCallback((next: Translations) => setT(next), [])

  // While session is loading, show nothing (avoids flash)
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (session?.user) {
    return <LoggedInHome userName={session.user.name ?? session.user.email ?? 'there'} />
  }

  // ── Marketing / landing page ──
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background phone grid */}
      <div
        className="absolute opacity-60"
        style={{
          top: "-20%",
          left: "-10%",
          width: "120%",
          height: "140%",
          transform: "rotate(-8deg)",
          transformOrigin: "center",
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: "12px",
          padding: "12px",
        }}
      >
        {profiles.map((p) => (
          <PhoneCard key={p.photo} {...p} />
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <Navbar onLangChange={handleLangChange} />

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-white font-black text-6xl md:text-8xl tracking-tight drop-shadow-lg">
          {t.hero.heading}<span className="text-3xl md:text-4xl align-super">™</span>
        </h1>
        <a
          href="/register"
          className="mt-10 bg-linear-to-r from-pink-500 to-orange-400 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          {t.hero.cta}
        </a>
      </main>
    </div>
  )
}
