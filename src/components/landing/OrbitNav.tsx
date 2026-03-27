'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Briefcase, Star, User, BookOpen, Link as LinkIcon } from 'lucide-react'

// 5 icons evenly at 72° apart, starting from top (-90 = top in this coordinate system).
// angle=0 → TOP, angle=90 → RIGHT, angle=180 → BOTTOM, angle=-90/270 → LEFT
const sections = [
  {
    id: 'projects',
    label: 'Projects',
    icon: Briefcase,
    href: '/projects',
    preview: "Work I've built — apps, systems, and ideas brought to life.",
    angle: -72,   // upper-left
    color: 'from-blue-500 to-cyan-400',
    shadowColor: 'rgba(59,130,246,0.5)',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Star,
    href: '/experience',
    preview: 'My professional journey and career milestones.',
    angle: 0,     // top
    color: 'from-violet-500 to-purple-400',
    shadowColor: 'rgba(139,92,246,0.5)',
  },
  {
    id: 'about',
    label: 'About',
    icon: User,
    href: '/about',
    preview: 'Who I am beyond the resume.',
    angle: 72,    // upper-right
    color: 'from-emerald-500 to-teal-400',
    shadowColor: 'rgba(16,185,129,0.5)',
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: BookOpen,
    href: '/stories',
    preview: 'Personal moments, reflections, and life beyond work.',
    angle: 144,   // lower-right
    color: 'from-amber-500 to-orange-400',
    shadowColor: 'rgba(245,158,11,0.5)',
  },
  {
    id: 'connect',
    label: 'Connect',
    icon: LinkIcon,
    href: '#connect',
    preview: "Let's talk — I'd love to hear from you.",
    angle: 216,   // lower-left
    color: 'from-rose-500 to-pink-400',
    shadowColor: 'rgba(244,63,94,0.5)',
  },
]

// angle=0 → TOP because we subtract 90° before converting
function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius }
}

export default function OrbitNav({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'lg'>('lg')

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      if (w < 640) setScreenSize('xs')       // < 640px: 160×200 card
      else if (w < 768) setScreenSize('sm')  // 640-767px: 208×256 card
      else setScreenSize('lg')               // ≥ 768px: 256×320 card
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Radius clears each card size:
  // xs  card 160×200 → half-diagonal ≈ 128px → radius 150 gives ~22px clearance, fits 320px screen
  // sm  card 208×256 → half-diagonal ≈ 166px → radius 190 gives ~24px clearance
  // lg  card 256×320 → half-diagonal ≈ 205px → radius 240 gives ~35px clearance
  const radius = screenSize === 'xs' ? 150 : screenSize === 'sm' ? 190 : 240

  return (
    <AnimatePresence>
      {visible && (
        <>
          {sections.map((section, i) => {
            const { x, y } = polarToXY(section.angle, radius)
            const Icon = section.icon
            const isHovered = hovered === section.id

            return (
              <motion.div
                key={section.id}
                className="absolute"
                style={{
                  // Position relative to center of the container (which is the card)
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  // Tooltips need z-[30], icons at z-[20] (set on parent in page.tsx)
                  zIndex: isHovered ? 30 : 20,
                }}
                initial={{ opacity: 0, scale: 0, x: x * 0.3, y: y * 0.3 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  delay: i * 0.07 + 0.5,
                  type: 'spring',
                  stiffness: 280,
                  damping: 22,
                }}
              >
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0"
                  style={{ backgroundColor: section.shadowColor }}
                  animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />

                <Link href={section.href} className="block">
                  <motion.div
                    className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
                    onMouseEnter={() => setHovered(section.id)}
                    onMouseLeave={() => setHovered(null)}
                    onTouchStart={() => setHovered(isHovered ? null : section.id)}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {/* Icon circle */}
                    <motion.div
                      className={`w-11 h-11 md:w-13 md:h-13 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center`}
                      animate={{
                        boxShadow: isHovered
                          ? `0 0 20px ${section.shadowColor}, 0 0 40px ${section.shadowColor}`
                          : `0 4px 15px ${section.shadowColor}`,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={1.8} />
                    </motion.div>

                    {/* Label */}
                    <motion.span
                      className="mt-1 text-[10px] md:text-xs font-medium tracking-wide whitespace-nowrap"
                      animate={{ color: isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.65)' }}
                    >
                      {section.label}
                    </motion.span>

                    {/* Tooltip — aligned to avoid viewport edges on mobile */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          className={[
                            'absolute bottom-full mb-3 w-36 md:w-44',
                            'bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 pointer-events-none shadow-xl',
                            // Icons with large positive x (right side) → right-align tooltip so it doesn't overflow right
                            // Icons with large negative x (left side) → left-align tooltip so it doesn't overflow left
                            // Others → center
                            x > 50 ? 'right-1/2 translate-x-1/2 text-right'
                            : x < -50 ? 'left-1/2 -translate-x-1/2 text-left'
                            : 'left-1/2 -translate-x-1/2 text-center',
                          ].join(' ')}
                          style={{ zIndex: 30 }}
                          initial={{ opacity: 0, y: 6, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.94 }}
                          transition={{ duration: 0.15 }}
                        >
                          <p className="text-[11px] text-white/75 leading-snug">{section.preview}</p>
                          <div className={[
                            'absolute -bottom-1.5 w-3 h-3 bg-slate-900 border-r border-b border-white/10 rotate-45',
                            x > 50 ? 'right-4' : x < -50 ? 'left-4' : 'left-1/2 -translate-x-1/2',
                          ].join(' ')} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </>
      )}
    </AnimatePresence>
  )
}
