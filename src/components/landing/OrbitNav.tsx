'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Briefcase, Star, User, BookOpen, Link as LinkIcon } from 'lucide-react'

const sections = [
  {
    id: 'projects',
    label: 'Projects',
    icon: Briefcase,
    href: '/projects',
    preview: 'Work I\'ve built — apps, systems, and ideas brought to life.',
    angle: -60,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Star,
    href: '/experience',
    preview: 'My professional journey and career milestones.',
    angle: 0,
    color: 'from-violet-500 to-purple-400',
  },
  {
    id: 'about',
    label: 'About',
    icon: User,
    href: '/about',
    preview: 'Who I am beyond the resume.',
    angle: 60,
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: BookOpen,
    href: '/stories',
    preview: 'Personal moments, reflections, and life beyond work.',
    angle: 120,
    color: 'from-amber-500 to-orange-400',
  },
  {
    id: 'connect',
    label: 'Connect',
    icon: LinkIcon,
    href: '#connect',
    preview: 'Let\'s talk — I\'d love to hear from you.',
    angle: 180,
    color: 'from-rose-500 to-pink-400',
  },
]

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  }
}

export default function OrbitNav({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 110 : 160

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {sections.map((section, i) => {
            const pos = polarToCartesian(section.angle, radius)
            const Icon = section.icon
            const isHovered = hovered === section.id

            return (
              <motion.div
                key={section.id}
                className="absolute pointer-events-auto"
                style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: i * 0.08 + 0.3, type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Orbit dot pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/20"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                />

                <Link href={section.href}>
                  <motion.div
                    className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    onMouseEnter={() => setHovered(section.id)}
                    onMouseLeave={() => setHovered(null)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg cursor-pointer`}
                      animate={isHovered ? { boxShadow: '0 0 24px rgba(255,255,255,0.4)' } : {}}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
                    </motion.div>

                    <motion.span
                      className="mt-1.5 text-xs font-medium text-white/80 tracking-wide whitespace-nowrap"
                      animate={isHovered ? { color: 'rgba(255,255,255,1)' } : {}}
                    >
                      {section.label}
                    </motion.span>

                    {/* Hover preview tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-44 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-center pointer-events-none"
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                        >
                          <p className="text-xs text-white/80 leading-snug">{section.preview}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}
