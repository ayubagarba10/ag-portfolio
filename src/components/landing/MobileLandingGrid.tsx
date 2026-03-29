'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Briefcase, Star, User, BookOpen, Link as LinkIcon } from 'lucide-react'

const sections = [
  {
    id: 'projects',
    label: 'Projects',
    Icon: Briefcase,
    href: '/projects',
    color: 'from-blue-500 to-cyan-400',
    preview: "Work I've built — apps, systems, and ideas brought to life.",
  },
  {
    id: 'experience',
    label: 'Experience',
    Icon: Star,
    href: '/experience',
    color: 'from-violet-500 to-purple-400',
    preview: 'My professional journey and career milestones.',
  },
  {
    id: 'about',
    label: 'About',
    Icon: User,
    href: '/about',
    color: 'from-emerald-500 to-teal-400',
    preview: 'Who I am beyond the resume.',
  },
  {
    id: 'stories',
    label: 'Stories',
    Icon: BookOpen,
    href: '/stories',
    color: 'from-amber-500 to-orange-400',
    preview: 'Personal moments, reflections, and life beyond work.',
  },
  {
    id: 'connect',
    label: 'Connect',
    Icon: LinkIcon,
    href: '/connect',
    color: 'from-rose-500 to-pink-400',
    preview: "Let's talk — I'd love to hear from you.",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
}

export default function MobileLandingGrid({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 w-full px-4"
      variants={containerVariants}
      initial="hidden"
      animate={visible ? 'visible' : 'hidden'}
    >
      {sections.map(({ id, label, Icon, href, color, preview }, index) => {
        const isLast = index === sections.length - 1
        return (
          <motion.div
            key={id}
            variants={itemVariants}
            className={isLast ? 'col-span-2 flex justify-center' : ''}
          >
            <Link href={href} className={isLast ? 'block w-1/2' : 'block'}>
              <div className="flex flex-col items-center gap-2 py-5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl active:scale-95 transition-all duration-150 text-center">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
                </div>
                <span className="text-white text-sm font-medium">{label}</span>
                <span className="text-white/40 text-[11px] leading-snug">{preview}</span>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
