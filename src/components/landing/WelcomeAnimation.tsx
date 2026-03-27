'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function WelcomeAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'doors' | 'done'>('doors')

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 2200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase === 'doors' && (
        <motion.div
          className="fixed inset-0 z-50 flex overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left door */}
          <motion.div
            className="w-1/2 h-full bg-slate-900 flex items-center justify-end pr-8"
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            transition={{ duration: 1.1, delay: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white text-right"
            >
              <p className="text-sm tracking-[0.3em] uppercase text-slate-400 mb-1">Welcome to</p>
            </motion.div>
          </motion.div>

          {/* Right door */}
          <motion.div
            className="w-1/2 h-full bg-slate-900 flex items-center justify-start pl-8"
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.1, delay: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white"
            >
              <p className="text-sm tracking-[0.3em] uppercase text-slate-400 mb-1">my world</p>
            </motion.div>
          </motion.div>

          {/* Center seam line */}
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
