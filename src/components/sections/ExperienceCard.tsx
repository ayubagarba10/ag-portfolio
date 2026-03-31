'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Briefcase } from 'lucide-react'

interface Experience {
  id: string
  role: string
  company: string
  description?: string
  preview_text?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
  slug?: string
  media?: { url: string; alt_text?: string; source_type?: string; external_url?: string }[]
}

function formatDate(d: string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function isSupabaseUrl(url: string) {
  return url.includes('.supabase.co')
}

export default function ExperienceCard({ experience: exp, index }: { experience: Experience; index: number }) {
  const preview = exp.preview_text || exp.description?.slice(0, 120) || ''
  const cover = exp.media?.[0]
  const coverUrl = cover?.source_type === 'external_link' && cover?.external_url ? cover.external_url : cover?.url
  const href = exp.slug ? `/experience/${exp.slug}` : undefined

  const cardContent = (
    <motion.div
      className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-violet-500/40 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <div className="p-5 flex gap-4">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-violet-950/40 border border-white/[0.07]">
          {coverUrl ? (
            isSupabaseUrl(coverUrl) ? (
              <Image src={coverUrl} alt={cover?.alt_text || exp.role} fill className="object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt={cover?.alt_text || exp.role} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-violet-400/50" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold text-white text-base leading-tight">{exp.role}</h3>
              <p className="text-violet-400 text-sm">{exp.company}</p>
            </div>
            <span className="text-xs text-white/30 whitespace-nowrap flex-shrink-0 mt-0.5">
              {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
            </span>
          </div>
          {preview && (
            <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mt-2">{preview}</p>
          )}
          {href && (
            <p className="mt-3 text-xs font-medium text-violet-400 group-hover:text-violet-300 flex items-center gap-1 transition-colors">
              Read more <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (href) return <Link href={href}>{cardContent}</Link>
  return cardContent
}
