'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface Story {
  id: string
  title: string
  content?: string
  slug: string
  created_at: string
  media?: { url: string; alt_text: string; source_type?: string; external_url?: string }[]
}

function isSupabaseUrl(url: string) {
  return url.includes('.supabase.co')
}

export default function StoryPost({ story, index }: { story: Story; index: number }) {
  const cover = story.media?.[0]
  const coverUrl = cover?.source_type === 'external_link' && cover?.external_url
    ? cover.external_url
    : cover?.url

  const date = new Date(story.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`/stories/post/${story.slug}`}>
      <motion.article
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
      >
        {coverUrl && (
          <div className="relative h-52 overflow-hidden">
            {isSupabaseUrl(coverUrl) ? (
              <Image
                src={coverUrl}
                alt={cover?.alt_text || story.title}
                fill
                className="object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt={cover?.alt_text || story.title}
                className="w-full h-full object-cover"
              />
            )}
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
    </Link>
  )
}
