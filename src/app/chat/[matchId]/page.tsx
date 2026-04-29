'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

type Message = { id: string; body: string; fromUserId: string; createdAt: string }
type MatchUser = {
  id: string
  name: string | null
  profile: {
    bio: string | null
    age: number | null
    gender: string | null
    photos: { url: string }[]
  } | null
}

export default function ChatPage() {
  const { status } = useSession()
  const router = useRouter()
  const { matchId } = useParams<{ matchId: string }>()

  const [messages, setMessages] = useState<Message[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [matchUser, setMatchUser] = useState<MatchUser | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!matchId) return
    try {
      const res = await fetch(`/api/messages/${matchId}`, { credentials: 'include' })
      if (!res.ok) {
        if (isInitial) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? `Error ${res.status}`)
          setLoading(false)
        }
        return
      }
      const data = await res.json()
      setMessages(data.messages ?? [])
      setMyId(data.myId)
      setMatchUser(data.matchUser)
      setLoading(false)
      setError(null)
    } catch {
      if (isInitial) {
        setError('Could not load chat. Please try again.')
        setLoading(false)
      }
    }
  }, [matchId])

  // Initial load
  useEffect(() => {
    if (status !== 'authenticated') return
    fetchMessages(true)
  }, [status, fetchMessages])

  // Poll every 3 seconds for new messages
  useEffect(() => {
    if (status !== 'authenticated') return
    const id = setInterval(() => fetchMessages(false), 3000)
    return () => clearInterval(id)
  }, [status, fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const body = input.trim()
    if (!body || sending) return
    setSending(true)
    setInput('')
    await fetch(`/api/messages/${matchId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body }),
    })
    await fetchMessages(false)
    setSending(false)
    inputRef.current?.focus()
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">⚠️</div>
        <p className="text-white font-semibold">Could not open chat</p>
        <p className="text-white/40 text-sm">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-6 py-2 rounded-full border border-white/20 text-white/60 hover:text-white text-sm transition-colors"
        >
          ← Back to home
        </button>
      </div>
    )
  }

  const avatar = matchUser?.profile?.photos?.[0]?.url

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-zinc-950 sticky top-0 z-10">
        <button
          onClick={() => router.push('/')}
          className="text-white/50 hover:text-white text-xl transition-colors mr-1"
        >
          ←
        </button>
        <button
          onClick={() => { setProfilePhotoIndex(0); setShowProfile(true) }}
          className="w-10 h-10 rounded-full overflow-hidden border border-pink-500/50 shrink-0 hover:border-pink-400 transition-colors"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={matchUser?.name ?? ''} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-lg">👤</div>
          )}
        </button>
        <div>
          <p className="text-white font-semibold text-sm">{matchUser?.name ?? 'Match'}</p>
          <p className="text-pink-400 text-xs">Match</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center py-16">
            <div>
              <div className="text-5xl mb-3">💬</div>
              <p className="text-white/40 text-sm">Say hello to {matchUser?.name?.split(' ')[0] ?? 'your match'}!</p>
            </div>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.fromUserId === myId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-pink-500 text-white rounded-br-sm'
                    : 'bg-zinc-800 text-white/90 rounded-bl-sm'
                }`}
              >
                {msg.body}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="sticky bottom-0 flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-zinc-950"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          className="flex-1 bg-zinc-800 border border-white/10 text-white text-sm rounded-full px-4 py-2.5 outline-none focus:border-pink-500 transition-colors placeholder:text-white/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-400 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4 rotate-45">
            <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405z" />
          </svg>
        </button>
      </form>

      {/* Profile modal */}
      {showProfile && matchUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            <div className="relative w-full h-96">
              {matchUser.profile?.photos && matchUser.profile.photos.length > 0 ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={matchUser.profile.photos[profilePhotoIndex]?.url}
                    alt={matchUser.name ?? ''}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Dot indicators */}
                  {matchUser.profile.photos.length > 1 && (
                    <div className="absolute top-3 left-0 right-0 flex gap-1 px-4">
                      {matchUser.profile.photos.map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full transition-all ${i === profilePhotoIndex ? 'bg-white' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  )}
                  {/* Tap zones */}
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 cursor-pointer" onClick={() => setProfilePhotoIndex((p) => Math.max(0, p - 1))} />
                    <div className="flex-1 cursor-pointer" onClick={() => setProfilePhotoIndex((p) => Math.min((matchUser.profile?.photos.length ?? 1) - 1, p + 1))} />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-6xl">👤</div>
              )}
              {/* Gradient overlay with name */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/40 to-transparent px-5 pt-16 pb-4">
                <h2 className="text-white font-black text-2xl leading-tight">
                  {matchUser.name ?? 'Unknown'}{matchUser.profile?.age ? `, ${matchUser.profile.age}` : ''}
                </h2>
                {matchUser.profile?.gender && (
                  <p className="text-white/50 text-sm">{matchUser.profile.gender}</p>
                )}
              </div>
              {/* Close button */}
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Bio */}
            {matchUser.profile?.bio && (
              <div className="px-5 py-4 border-t border-white/5">
                <p className="text-white/70 text-sm leading-relaxed">{matchUser.profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
