'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type Photo = { id: string; url: string; order: number }
type Profile = { bio: string | null; age: number | null; gender: string | null; photos: Photo[] }
type Card = { id: string; name: string | null; profile: Profile | null }

export default function SwipePage() {
  const { status } = useSession()
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [current, setCurrent] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<Card | null>(null)
  const [direction, setDirection] = useState<'left' | 'right' | 'super' | null>(null)
  const [superLikesLeft, setSuperLikesLeft] = useState(3)
  const [showSuperModal, setShowSuperModal] = useState(false)
  const [superSent, setSuperSent] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/swipe/cards', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setCards(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [status])

  const activeCard = cards[current]

  const swipe = useCallback(async (dir: 'left' | 'right' | 'super') => {
    if (!activeCard) return
    setDirection(dir)

    const res = await fetch('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        toUserId: activeCard.id,
        direction: dir === 'left' ? 'NOPE' : 'LIKE',
      }),
    })
    const data = await res.json()

    setTimeout(() => {
      setDirection(null)
      setSuperSent(false)
      setPhotoIndex(0)
      if (data.match) {
        setMatch(activeCard)
      } else {
        setCurrent((c) => c + 1)
      }
    }, 350)
  }, [activeCard])

  function openSuperLike() {
    if (superLikesLeft === 0) {
      setShowSuperModal(true)
      return
    }
    setShowSuperModal(true)
  }

  async function confirmSuperLike() {
    setShowSuperModal(false)
    if (superLikesLeft === 0) return
    setSuperLikesLeft(n => n - 1)
    setSuperSent(true)
    await swipe('super')
  }

  async function resetSwipes() {
    setResetting(true)
    await fetch('/api/swipe', { method: 'DELETE', credentials: 'include' })
    const res = await fetch('/api/swipe/cards', { credentials: 'include' })
    const data = await res.json()
    setCards(Array.isArray(data) ? data : [])
    setCurrent(0)
    setPhotoIndex(0)
    setResetting(false)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') swipe('left')
      if (e.key === 'ArrowRight') swipe('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [swipe])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <button onClick={() => router.push('/')} className="text-white/40 hover:text-white text-2xl transition-colors">🔥</button>
        <h1 className="text-white font-black text-xl tracking-tight">tinder</h1>
        <button onClick={() => router.push('/')} className="text-white/40 hover:text-white text-sm transition-colors">✕</button>
      </header>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {match ? (
          /* Match overlay */
          <div className="text-center">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-white font-black text-4xl mb-2">It&apos;s a Match!</h2>
            <p className="text-white/60 mb-8">You and {match.name} liked each other.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { setMatch(null); setCurrent((c) => c + 1) }}
                className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Keep swiping
              </button>
              <button
                onClick={() => router.push(`/chat/${match.id}`)}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold"
              >
                Send message
              </button>
            </div>
          </div>
        ) : !activeCard ? (
          /* No more cards */
          <div className="text-center">
            <div className="text-7xl mb-4">😅</div>
            <h2 className="text-white text-2xl font-bold mb-2">You&apos;ve seen everyone!</h2>
            <p className="text-white/50 mb-6">Check back later for new people.</p>
            <button
              onClick={resetSwipes}
              disabled={resetting}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold disabled:opacity-50"
            >
              {resetting ? 'Resetting…' : 'Start over 🔄'}
            </button>
          </div>
        ) : (
          <>
            {/* Card */}
            <div
              className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transition-transform duration-350"
              style={{
                transform: direction === 'right'
                  ? 'translateX(120%) rotate(20deg)'
                  : direction === 'left'
                  ? 'translateX(-120%) rotate(-20deg)'
                  : 'none',
              }}
            >
              {/* Photo */}
              {activeCard.profile?.photos?.length ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeCard.profile.photos[photoIndex]?.url}
                  alt={activeCard.name ?? ''}
                  className="w-full h-[520px] object-cover"
                />
              ) : (
                <div className="w-full h-[520px] bg-zinc-800 flex items-center justify-center">
                  <span className="text-white/20 text-6xl">👤</span>
                </div>
              )}

              {/* Photo indicator dots */}
              {(activeCard.profile?.photos?.length ?? 0) > 1 && (
                <div className="absolute top-3 left-0 right-0 flex gap-1 justify-center px-4">
                  {activeCard.profile!.photos.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-all ${i === photoIndex ? 'bg-white' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              )}

              {/* Tap zones for photo nav */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 cursor-pointer" onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))} />
                <div className="flex-1 cursor-pointer" onClick={() => setPhotoIndex((p) => Math.min((activeCard.profile?.photos?.length ?? 1) - 1, p + 1))} />
              </div>

              {/* LIKE / NOPE / SUPER stamp */}
              {(direction === 'right' || direction === 'super') && (
                <div className="absolute top-10 left-6 border-4 border-green-400 text-green-400 font-black text-3xl px-4 py-1 rounded-xl rotate-[-15deg] opacity-90">
                  LIKE
                </div>
              )}
              {direction === 'left' && (
                <div className="absolute top-10 right-6 border-4 border-red-400 text-red-400 font-black text-3xl px-4 py-1 rounded-xl rotate-[15deg] opacity-90">
                  NOPE
                </div>
              )}
              {superSent && direction === null && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-blue-400 text-blue-400 font-black text-2xl px-4 py-2 rounded-xl opacity-90 text-center whitespace-nowrap">
                  ⚡ SUPER LIKE
                </div>
              )}

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-16">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-white font-black text-3xl">
                      {activeCard.name ?? 'Unknown'}{activeCard.profile?.age ? `, ${activeCard.profile.age}` : ''}
                    </h2>
                    {activeCard.profile?.bio && (
                      <p className="text-white/80 text-sm mt-1 line-clamp-2">{activeCard.profile.bio}</p>
                    )}
                  </div>
                  <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg shrink-0">
                    ℹ
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-6 mt-8 items-center">
              <button
                onClick={() => swipe('left')}
                className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-red-400 flex items-center justify-center text-red-400 text-2xl shadow-lg hover:scale-110 transition-transform"
              >
                ✕
              </button>
              <button
                onClick={openSuperLike}
                className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-blue-400 flex items-center justify-center text-blue-400 text-xl shadow-lg hover:scale-110 transition-transform relative"
              >
                ⚡
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{superLikesLeft}</span>
              </button>
              <button
                onClick={() => swipe('right')}
                className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-green-400 flex items-center justify-center text-green-400 text-2xl shadow-lg hover:scale-110 transition-transform"
              >
                ♥
              </button>
            </div>
          </>
        )}
      </div>
      {/* Super Like modal */}
      {showSuperModal && activeCard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            {superLikesLeft > 0 ? (
              <>
                <div className="text-5xl mb-3">⚡</div>
                <h3 className="text-white font-black text-xl mb-1">Super Like</h3>
                <p className="text-white/50 text-sm mb-4">
                  Let <span className="text-white font-semibold">{activeCard.name}</span> know you&apos;re really interested — they&apos;ll see you Super Liked them before deciding.
                </p>
                <p className="text-blue-400 text-sm font-semibold mb-6">{superLikesLeft} Super Like{superLikesLeft !== 1 ? 's' : ''} remaining today</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSuperModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSuperLike}
                    className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-colors"
                  >
                    Send ⚡
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">⚡</div>
                <h3 className="text-white font-black text-xl mb-1">Out of Super Likes</h3>
                <p className="text-white/50 text-sm mb-6">You&apos;ve used all your Super Likes for today. Come back tomorrow or upgrade to get unlimited Super Likes.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSuperModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Maybe later
                  </button>
                  <button
                    onClick={() => setShowSuperModal(false)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold transition-opacity hover:opacity-90"
                  >
                    ✨ Get Gold
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
