'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface StoryEpisode {
  id: string
  title: string
  content?: string
  preview_text?: string
  slug: string
  episode_number?: number
  created_at: string
}

export default function StoryEpisodeCard({
  episode,
  seriesSlug,
  index,
}: {
  episode: StoryEpisode
  seriesSlug: string
  index: number
}) {
  const preview = episode.preview_text || episode.content?.slice(0, 120) || ''
  const date = new Date(episode.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`/stories/${seriesSlug}/${episode.slug}`}>
      <motion.div
        className="group flex gap-4 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
      >
        {/* Episode number badge — always shown */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center gap-0">
          <span className="text-[9px] font-semibold text-amber-500/70 uppercase tracking-wider leading-none">Ep</span>
          <span className="text-base font-bold text-amber-400 leading-none">{episode.episode_number ?? index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-snug">{episode.title}</h3>
            <time className="text-xs text-white/30 flex-shrink-0">{date}</time>
          </div>
          {preview && (
            <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mt-1">{preview}</p>
          )}
          <p className="mt-2 text-xs font-medium text-amber-400 group-hover:text-amber-300 flex items-center gap-1 transition-colors">
            Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
