'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Link2, Check } from 'lucide-react'
import MediaGallery from '@/components/ui/MediaGallery'

interface MediaItem {
  url: string
  alt_text?: string
  media_type?: string
  source_type?: string
  external_url?: string
}

interface Story {
  id: string
  title: string
  content?: string
  slug: string
  created_at: string
}

export default function StoryDetail({
  story,
  media,
}: {
  story: Story
  media: MediaItem[]
}) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const date = new Date(story.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const paragraphs = (story.content || '').split('\n').filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
        <Link href="/stories" className="hover:text-white/70 transition-colors">Stories</Link>
      </div>

      <div className={`grid gap-10 ${media.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
        {/* Left — content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight">{story.title}</h1>
            <time className="text-white/30 text-sm mt-2 block">{date}</time>
          </div>

          {paragraphs.length > 0 ? (
            <div className="space-y-4">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-white/70 text-base leading-relaxed">{para}</p>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm italic">No content added yet.</p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Stories
            </Link>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Right — gallery (only if media exists) */}
        {media.length > 0 && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <MediaGallery media={media} speedSeconds={5} />
          </div>
        )}
      </div>
    </div>
  )
}
