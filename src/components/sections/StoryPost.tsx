'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface Story {
  id: string
  title: string
  content?: string
  slug: string
  created_at: string
  media?: { url: string; alt_text: string }[]
}

export default function StoryPost({ story, index }: { story: Story; index: number }) {
  const cover = story.media?.[0]
  const date = new Date(story.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.article
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {cover && (
        <div className="relative h-52 overflow-hidden">
          <Image
            src={cover.url}
            alt={cover.alt_text || story.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
        </div>
      )}
      <div className="p-6">
        <time className="text-xs text-white/30">{date}</time>
        <h3 className="text-white font-semibold text-lg mt-1 mb-3">{story.title}</h3>
        {story.content && (
          <p className="text-white/50 text-sm leading-relaxed line-clamp-4">{story.content}</p>
        )}
      </div>
    </motion.article>
  )
}
