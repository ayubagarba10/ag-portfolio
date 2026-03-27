'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface CinematicHeroProps {
  profileImageUrl: string
  name: string
  headline: string
  visible: boolean
}

export default function CinematicHero({ profileImageUrl, name, headline, visible }: CinematicHeroProps) {
  return (
    <motion.div
      className="relative w-full h-full flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Ambient glow behind photo */}
      <motion.div
        className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Profile image */}
      <motion.div
        className="relative w-52 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 z-10"
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 120 }}
      >
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={name}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <span className="text-4xl text-white/30">AG</span>
          </div>
        )}
        {/* Subtle gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      </motion.div>

      {/* Name + headline */}
      <motion.div
        className="mt-6 text-center z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{name || 'Welcome'}</h1>
        {headline && (
          <p className="mt-1.5 text-sm md:text-base text-white/60 font-light max-w-xs">{headline}</p>
        )}
      </motion.div>

      {/* Scroll hint */}
      <motion.p
        className="absolute bottom-8 text-xs text-white/30 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        Hover the icons to explore
      </motion.p>
    </motion.div>
  )
}
