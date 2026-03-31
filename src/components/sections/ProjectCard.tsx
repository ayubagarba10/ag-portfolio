'use client'

import { motion } from 'framer-motion'
import { Image as ImageIcon, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string
  preview_text?: string
  external_link?: string
  slug: string
  media?: { url: string; alt_text: string; source_type?: string; external_url?: string }[]
}

function isSupabaseUrl(url: string) {
  return url.includes('.supabase.co')
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const coverImage = project.media?.[0]
  const coverUrl = coverImage?.source_type === 'external_link' && coverImage?.external_url
    ? coverImage.external_url
    : coverImage?.url
  const displayText = project.preview_text || project.description

  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.div
        className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-blue-500/40 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.5 }}
      >
        {/* Cover image */}
        <div className="relative h-44 bg-slate-800 overflow-hidden">
          {coverUrl ? (
            isSupabaseUrl(coverUrl) ? (
              <Image
                src={coverUrl}
                alt={coverImage?.alt_text || project.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt={coverImage?.alt_text || project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-white text-base mb-2">{project.title}</h3>
          {displayText && (
            <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{displayText}</p>
          )}
          <p className="mt-3 text-xs font-medium text-blue-400 group-hover:text-blue-300 flex items-center gap-1 transition-colors">
            View project <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
