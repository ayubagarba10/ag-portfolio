'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Sparkles } from 'lucide-react'

interface GiftBoxModalProps {
  open: boolean
  onClose: () => void
  profileImageUrl: string
  ownerName: string
}

// Confetti particle
function Particle({ i }: { i: number }) {
  const colors = ['#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981']
  const color = colors[i % colors.length]
  const x = (Math.random() - 0.5) * 300
  const y = -(Math.random() * 200 + 50)
  const rotate = Math.random() * 720 - 360
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, top: '50%', left: '50%' }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ x, y, opacity: 0, rotate, scale: 0.5 }}
      transition={{ duration: 0.9, delay: i * 0.03, ease: 'easeOut' }}
    />
  )
}

export default function GiftBoxModal({ open, onClose, profileImageUrl, ownerName }: GiftBoxModalProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (!open) {
      setShowContent(false)
      setMessage('')
      setParticles([])
      return
    }

    // Trigger particles
    setParticles(Array.from({ length: 20 }, (_, i) => i))

    // Fetch AI message
    setLoading(true)
    const timer = setTimeout(() => setShowContent(true), 800)

    fetch('/api/gift-message', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        setMessage(d.message || 'You are more remarkable than you know.')
        setLoading(false)
      })
      .catch(() => {
        setMessage('You are more remarkable than you know.')
        setLoading(false)
      })

    return () => clearTimeout(timer)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 flex flex-col max-h-[80vh] overflow-hidden border border-white/10 shadow-2xl"
            initial={{ scale: 0.5, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-3 text-white/40 hover:text-white/80 transition-colors rounded-full"
            aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Confetti particles */}
            <div className="absolute top-1/3 left-1/2 pointer-events-none">
              {particles.map((i) => (
                <Particle key={i} i={i} />
              ))}
            </div>

            {/* Box lid animation */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ y: 0 }}
              animate={{ y: -10 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40"
                animate={{
                  boxShadow: ['0 0 20px rgba(251,191,36,0.4)', '0 0 40px rgba(251,191,36,0.7)', '0 0 20px rgba(251,191,36,0.4)'],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Owner photo */}
                  {profileImageUrl && (
                    <motion.div
                      className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-amber-400/50"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Image
                        src={profileImageUrl}
                        alt={ownerName}
                        width={64}
                        height={64}
                        className="object-cover object-top w-full h-full"
                      />
                    </motion.div>
                  )}

                  <p className="text-xs font-medium text-amber-400 tracking-widest uppercase mb-3">
                    A gift from {ownerName || 'me'} to you
                  </p>

                  {loading ? (
                    <div className="flex justify-center gap-1 mt-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/40"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.p
                      className="text-white/90 text-sm leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {message}
                    </motion.p>
                  )}

                  <motion.button
                    className="mt-6 text-xs text-white/30 hover:text-white/60 transition-colors"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                  >
                    Close ✕
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
