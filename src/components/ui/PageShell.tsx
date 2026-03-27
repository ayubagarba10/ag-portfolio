'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

interface PageShellProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  accentColor: string
  bgGradient: string
}

export default function PageShell({ children, title, subtitle, accentColor, bgGradient }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-slate-950 ${bgGradient} relative`}>
      {/* Background radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(30,41,59,0.6)_0%,_transparent_70%)]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <div className="flex gap-4 text-sm text-white/40">
          <Link href="/projects" className="hover:text-white/80 transition-colors">Projects</Link>
          <Link href="/experience" className="hover:text-white/80 transition-colors">Experience</Link>
          <Link href="/about" className="hover:text-white/80 transition-colors">About</Link>
          <Link href="/stories" className="hover:text-white/80 transition-colors">Stories</Link>
        </div>
      </nav>

      {/* Page header */}
      <motion.header
        className="relative z-10 px-6 md:px-12 pt-8 pb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10 text-${accentColor} mb-4`}>
          {title}
        </div>
        {subtitle && (
          <p className="text-white/50 text-sm max-w-xl mt-1">{subtitle}</p>
        )}
      </motion.header>

      {/* Content */}
      <motion.main
        className="relative z-10 px-6 md:px-12 pb-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {children}
      </motion.main>
    </div>
  )
}
