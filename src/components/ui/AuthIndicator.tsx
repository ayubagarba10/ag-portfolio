'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'

export default function AuthIndicator() {
  const [initials, setInitials] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Use getSession (reads localStorage, no navigator lock acquired)
    async function checkAuth(userId?: string | null) {
      if (!userId) { setInitials(null); return }

      const { data: profile } = await supabase
        .from('owner_profiles')
        .select('name')
        .eq('user_id', userId)
        .single()

      if (profile?.name) {
        const parts = profile.name.trim().split(' ')
        setInitials(parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].slice(0, 2).toUpperCase()
        )
      } else {
        setInitials('AG')
      }
    }

    // Initial load — getSession reads localStorage, no lock
    supabase.auth.getSession().then(({ data: { session } }) => checkAuth(session?.user?.id))

    // onAuthStateChange already provides the session — no getUser() needed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      checkAuth(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AnimatePresence>
      {initials && (
        <motion.div
          className="fixed top-4 right-4 z-40"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Link href="/dashboard">
            <motion.div
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer backdrop-blur-sm group relative"
              whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.18)' }}
              whileTap={{ scale: 0.93 }}
              title="Go to dashboard"
            >
              <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                {initials}
              </span>

              {/* Green dot — logged in indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />

              {/* Dashboard tooltip */}
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
                <LayoutDashboard className="w-3 h-3" />
                Dashboard
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
