'use client'

import { useState, useEffect, useCallback } from 'react'
import WelcomeAnimation from '@/components/landing/WelcomeAnimation'
import CinematicHero from '@/components/landing/CinematicHero'
import OrbitNav from '@/components/landing/OrbitNav'
import MobileLandingGrid from '@/components/landing/MobileLandingGrid'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'

interface OwnerProfile {
  name: string
  headline: string
  profile_image_url: string
  use_image_on_landing?: boolean
}

export default function HomePage() {
  const [welcomed, setWelcomed] = useState(false)
  const [profile, setProfile] = useState<OwnerProfile | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { if (data) setProfile(data) })
      .catch(() => {})

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_name: 'landing' }),
    }).catch(() => {})
  }, [])

  const handleWelcomeDone = useCallback(() => setWelcomed(true), [])

  return (
    <main className="relative w-screen min-h-screen overflow-x-hidden bg-slate-950">
      {/* z-0: Background radial gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,41,59,0.8)_0%,_rgba(2,6,23,1)_70%)]" />

      {/* z-0: Subtle grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* z-[100]: Welcome doors animation */}
      <WelcomeAnimation onComplete={handleWelcomeDone} />

      {/* z-10: Main content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">

        {/* DESKTOP: orbit layout — hidden on mobile */}
        <div className="hidden md:block relative w-[256px] h-[320px] overflow-visible">
          {/* z-[20]: Photo card */}
          <div className="relative z-[20] w-full h-full">
            <CinematicHero
              profileImageUrl={profile?.profile_image_url || ''}
              name={profile?.name || ''}
              headline={profile?.headline || ''}
              visible={welcomed}
              useImageOnLanding={profile?.use_image_on_landing !== false}
            />
          </div>
          {/* z-[30]: Orbit icons — must be ABOVE card so tooltips aren't clipped */}
          <div className="absolute inset-0 z-[30]">
            <OrbitNav visible={welcomed} />
          </div>
        </div>

        {/* MOBILE: stacked layout — hidden on md+ */}
        <div className="flex md:hidden flex-col items-center gap-6 w-full pt-16 pb-28 min-h-screen">
          {/* Profile card — 70vw wide with 4:5 aspect ratio */}
          <div className="relative w-[70vw] max-w-[220px] aspect-[4/5]">
            <div className="relative z-[20] w-full h-full">
              <CinematicHero
                profileImageUrl={profile?.profile_image_url || ''}
                name={profile?.name || ''}
                headline={profile?.headline || ''}
                visible={welcomed}
                useImageOnLanding={profile?.use_image_on_landing !== false}
              />
            </div>
          </div>
          {/* Section cards grid */}
          <MobileLandingGrid visible={welcomed} />
        </div>

      </div>

      {/* z-20: Owner login link — subtle top-right */}
      <motion.div
        className="absolute top-4 right-5 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: welcomed ? 1 : 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors text-xs tracking-wide group"
        >
          <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
          <span>Owner</span>
        </Link>
      </motion.div>

      {/* z-10: Bottom hint */}
      <motion.p
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[10px] text-white/20 tracking-[0.25em] uppercase whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: welcomed ? 1 : 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span className="hidden md:inline">Explore · Click any icon</span>
        <span className="md:hidden">Tap any section</span>
      </motion.p>
    </main>
  )
}
