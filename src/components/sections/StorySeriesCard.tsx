'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, ArrowRight } from 'lucide-react'

interface StorySeries {
  id: string
  title: string
  description?: string
  preview_text?: string
  slug: string
  cover_image_url?: string
  episode_count?: number
}

function isSupabaseUrl(url: string) {
  return url.includes('.supabase.co')
}

export default function StorySeriesCard({ series, index }: { series: StorySeries; index: number }) {
  const preview = series.preview_text || series.description?.slice(0, 120) || ''
  const cover = series.cover_image_url

  return (
    <Link href={`/stories/${series.slug}`}>
      <motion.div
        className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-amber-500/40 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.5 }}
      >
        {/* Cover */}
        <div className="relative h-40 bg-amber-950/20 overflow-hidden">
          {cover ? (
            isSupabaseUrl(cover) ? (
              <Image src={cover} alt={series.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-amber-400/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          {series.episode_count !== undefined && (
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 font-medium">
              {series.episode_count} {series.episode_count === 1 ? 'episode' : 'episodes'}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-white text-base mb-1">{series.title}</h3>
          {preview && (
            <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{preview}</p>
          )}
          <p className="mt-3 text-xs font-medium text-amber-400 group-hover:text-amber-300 flex items-center gap-1 transition-colors">
            View series <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
