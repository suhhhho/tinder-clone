'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const STEPS = ['basics', 'bio', 'photos', 'done'] as const
type Step = (typeof STEPS)[number]

interface UploadedPhoto {
  id: string
  url: string
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'

  const [step, setStep] = useState<Step>('basics')
  const [form, setForm] = useState({ name: '', age: '', gender: '', bio: '' })
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (isEdit) {
          // Pre-populate form with existing data
          if (data.profile) {
            setForm({
              name: data.name ?? '',
              age: data.profile.age ? String(data.profile.age) : '',
              gender: data.profile.gender ?? '',
              bio: data.profile.bio ?? '',
            })
          }
          if (Array.isArray(data.photos)) {
            setPhotos(data.photos)
          }
        } else if (data.complete) {
          router.replace('/')
        }
      })
  }, [router, isEdit])

  function next() {
    setStep((s) => {
      const i = STEPS.indexOf(s)
      return STEPS[i + 1] ?? s
    })
  }

  async function handleSave() {
    setError('')
    setLoading(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Something went wrong, please try again.')
      return
    }
    next()
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const toUpload = files.slice(0, 6 - photos.length)
    setUploading(true)
    const fd = new FormData()
    toUpload.forEach(f => fd.append('photos', f))
    const res = await fetch('/api/profile/photos', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    })
    setUploading(false)
    if (res.ok) {
      const newPhotos: UploadedPhoto[] = await res.json()
      setPhotos(p => [...p, ...newPhotos])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDeletePhoto(id: string) {
    const res = await fetch('/api/profile/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ photoId: id }),
    })
    if (res.ok) setPhotos(p => p.filter(ph => ph.id !== id))
  }

  const progress = ((STEPS.indexOf(step)) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🔥</span>
          <h1 className="text-white text-3xl font-black mt-2">tinder</h1>
        </div>

        {/* Progress bar */}
        {step !== 'done' && (
          <div className="w-full bg-white/10 rounded-full h-1 mb-8">
            <div
              className="bg-gradient-to-r from-pink-500 to-orange-400 h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {/* Step 1: Basics */}
          {step === 'basics' && (
            <>
              <h2 className="text-white text-2xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-white/50 text-sm mb-6">This is what others will see on your profile.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Your name</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-colors placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1 block">Age</label>
                  <input
                    type="number"
                    placeholder="Your age"
                    min={18}
                    max={99}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-colors placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1 block">I am a...</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Man', 'Woman', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm({ ...form, gender: g })}
                        className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                          form.gender === g
                            ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                            : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={next}
                  disabled={!form.name || !form.age || !form.gender}
                  className="mt-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Step 2: Bio */}
          {step === 'bio' && (
            <>
              <h2 className="text-white text-2xl font-bold mb-2">Write your bio</h2>
              <p className="text-white/50 text-sm mb-6">A short intro that shows your personality.</p>

              <div className="flex flex-col gap-4">
                <textarea
                  placeholder="e.g. Coffee lover ☕ | Hiking enthusiast 🏔️"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={150}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-colors placeholder:text-white/30 resize-none"
                />
                <p className="text-white/30 text-xs text-right">{form.bio.length}/150</p>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('basics')}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Continue'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Photos */}
          {step === 'photos' && (
            <>
              <h2 className="text-white text-2xl font-bold mb-2">Add your photos</h2>
              <p className="text-white/50 text-sm mb-6">Add up to 6 photos. Your first photo is your main profile picture.</p>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {photos.map((photo, i) => (
                  <div key={photo.id} className="relative aspect-3/4 rounded-xl overflow-hidden group">
                    <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      ✕
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-3/4 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-pink-500/50 hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="text-white/40 text-sm">Uploading...</span>
                    ) : (
                      <>
                        <span className="text-white/40 text-2xl">+</span>
                        <span className="text-white/40 text-xs">Add photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('bio')}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-linear-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  {photos.length === 0 ? 'Skip for now' : 'Continue'}
                </button>
              </div>
            </>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-white text-2xl font-bold mb-2">
                {isEdit ? 'Profile updated!' : "You're all set!"}
              </h2>
              <p className="text-white/50 text-sm mb-8">
                {isEdit ? 'Your changes have been saved.' : 'Your profile is ready. Time to start swiping.'}
              </p>
              <button
                onClick={() => router.push(isEdit ? '/' : '/swipe')}
                className="w-full bg-linear-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                {isEdit ? 'Back to home' : 'Start swiping 🔥'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
