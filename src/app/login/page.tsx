'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password')
      return
    }

    // Check if profile is filled, redirect to onboarding if not
    const profileRes = await fetch('/api/profile')
    const profileData = await profileRes.json()

    if (!profileData.complete) {
      router.push('/onboarding')
    } else {
      router.push('/swipe')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🔥</span>
          <h1 className="text-white text-3xl font-black mt-2">tinder</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-white text-2xl font-bold mb-6">Log in</h2>

          {registered && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">
              Account created! You can now log in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-colors placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-colors placeholder:text-white/30"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-white/50 text-sm text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-pink-400 hover:text-pink-300 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
