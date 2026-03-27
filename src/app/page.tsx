'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import WelcomeAnimation from '@/components/landing/WelcomeAnimation'
import CinematicHero from '@/components/landing/CinematicHero'
import OrbitNav from '@/components/landing/OrbitNav'

interface OwnerProfile {
  name: string
  headline: string
  profile_image_url: string
}

export default function HomePage() {
  const [welcomed, setWelcomed] = useState(false)
  const [profile, setProfile] = useState<OwnerProfile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('owner_profiles')
      .select('name, headline, profile_image_url')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data)
      })

    // Track visit
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_name: 'landing' }),
    }).catch(() => {})
  }, [])

  const handleWelcomeDone = useCallback(() => setWelcomed(true), [])

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,41,59,0.8)_0%,_rgba(2,6,23,1)_70%)]" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Welcome doors animation */}
      <WelcomeAnimation onComplete={handleWelcomeDone} />

      {/* Hero + orbit nav */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <CinematicHero
          profileImageUrl={profile?.profile_image_url || ''}
          name={profile?.name || ''}
          headline={profile?.headline || ''}
          visible={welcomed}
        />
        <OrbitNav visible={welcomed} />
      </div>
    </main>
  )
}
