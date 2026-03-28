'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, LayoutDashboard, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slowConnection, setSlowConnection] = useState(false)
  const [showChoice, setShowChoice] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSlowConnection(false)

    // Show patience message throughout the entire login process (auth + profile fetch)
    const slowTimer = setTimeout(() => setSlowConnection(true), 7000)

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !authData.user) {
        setError(authError?.message || 'Login failed. Please check your email and password.')
        return
      }

      // Check if owner profile + onboarding exist
      const { data: profile } = await supabase
        .from('owner_profiles')
        .select('onboarding_complete')
        .eq('user_id', authData.user.id)
        .single()

      const isDone = profile?.onboarding_complete === true
      setOnboardingDone(isDone)

      if (!isDone) {
        router.push('/onboarding')
        return
      }

      // Returning user with completed onboarding: show choice screen
      setShowChoice(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      clearTimeout(slowTimer)
      setSlowConnection(false)
      setLoading(false)
    }
  }

  if (showChoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,41,59,0.5)_0%,_transparent_70%)]" />
        <motion.div
          className="relative w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-lg">👋</span>
            </div>
            <h1 className="text-xl font-semibold text-white">Welcome back</h1>
            <p className="text-white/40 text-sm mt-1">Where would you like to go?</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-4 p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-white/25 hover:bg-white/[0.07] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">Dashboard</p>
                <p className="text-white/40 text-xs mt-0.5">Manage content, upload media, view analytics</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/onboarding')}
              className="w-full flex items-center gap-4 p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-white/25 hover:bg-white/[0.07] transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">Setup Wizard</p>
                <p className="text-white/40 text-xs mt-0.5">Update your profile, photo and links</p>
              </div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-white/25 text-xs hover:text-white/50 transition-colors">
              ← Back to portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,41,59,0.5)_0%,_transparent_70%)]" />

      <motion.div
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-white/40" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Owner Sign In</h1>
          <p className="text-white/35 text-sm mt-1">Access your portfolio dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {error && (
            <motion.p
              className="text-red-400/90 text-xs text-center py-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-950 font-semibold text-sm py-3 rounded-xl hover:bg-white/92 active:scale-[0.98] transition-all disabled:opacity-40 mt-1"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {slowConnection && (
            <motion.p
              className="text-white/30 text-xs text-center mt-2 leading-snug"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Taking a moment — the server may be waking up. Please wait…
            </motion.p>
          )}
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-white/25 text-xs hover:text-white/50 transition-colors">
            ← Back to portfolio
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
