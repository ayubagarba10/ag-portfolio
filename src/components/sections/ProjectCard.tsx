'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  description: string
  external_link?: string
  slug: string
  media?: { url: string; alt_text: string }[]
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const coverImage = project.media?.[0]

  return (
    <motion.div
      className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
    >
      {/* Cover image */}
      <div className="relative h-44 bg-slate-800 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt_text || project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-base mb-2">{project.title}</h3>
        {project.description && (
          <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{project.description}</p>
        )}
        {project.external_link && (
          <a
            href={project.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            View project <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  )
}
