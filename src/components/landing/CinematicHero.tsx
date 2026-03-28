'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface CinematicHeroProps {
  profileImageUrl: string
  name: string
  headline: string
  visible: boolean
  useImageOnLanding?: boolean
}

export default function CinematicHero({ profileImageUrl, name, headline, visible, useImageOnLanding = true }: CinematicHeroProps) {
  const showImage = profileImageUrl && useImageOnLanding

  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, scale: 0.93, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.93, y: visible ? 0 : 20 }}
      transition={{ duration: 0.9, delay: 0.4, type: 'spring', stiffness: 100, damping: 18 }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute -inset-8 rounded-full bg-blue-500/8 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Card */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/[0.08]">
        {/* Photo */}
        {showImage ? (
          <Image
            src={profileImageUrl}
            alt={name || 'Profile photo'}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 768px) 208px, 256px"
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-5xl font-bold text-white/10 tracking-tight">AG</span>
          </div>
        )}

        {/* Bottom gradient overlay — name lives here */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

        {/* Name + headline inside card */}
        <motion.div
          className="absolute inset-x-0 bottom-0 p-4 pb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h1 className="text-white font-semibold text-lg md:text-xl leading-tight tracking-tight text-center">
            {name || 'Welcome'}
          </h1>
          {headline && (
            <p className="text-white/55 text-xs md:text-sm mt-0.5 leading-snug font-light text-center">
              {headline}
            </p>
          )}
        </motion.div>

        {/* Top shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </motion.div>
  )
}
