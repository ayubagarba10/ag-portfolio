'use client'

import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'

export default function GiftBoxIcon({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 cursor-pointer"
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 2, type: 'spring', stiffness: 280, damping: 18 }}
      aria-label="Open gift"
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-amber-400"
        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <Gift className="w-6 h-6 text-white relative z-10" strokeWidth={1.5} />
    </motion.button>
  )
}
