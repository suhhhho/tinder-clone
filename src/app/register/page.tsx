'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      return
    }

    // Auto sign-in then go straight to onboarding
    await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    router.push('/onboarding')  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🔥</span>
          <h1 className="text-white text-3xl font-black mt-2">tinder</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-white text-2xl font-bold mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-colors placeholder:text-white/30"
              />
            </div>

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
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-white/50 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
