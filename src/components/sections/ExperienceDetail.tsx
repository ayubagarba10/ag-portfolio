'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Link2, Check } from 'lucide-react'
import MediaGallery from '@/components/ui/MediaGallery'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

interface Experience {
  id: string
  role: string
  company: string
  description?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
  gallery_speed?: number
}

interface MediaItem {
  url: string
  alt_text?: string
  media_type?: string
  source_type?: string
  external_url?: string
}

function formatDate(d: string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function ExperienceDetail({
  experience: exp,
  media,
}: {
  experience: Experience
  media: MediaItem[]
}) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/experience"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Experience
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left — content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight">{exp.role}</h1>
            <p className="text-violet-400 text-lg mt-1">{exp.company}</p>
            <p className="text-white/30 text-sm mt-2">
              {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
            </p>
          </div>

          {exp.description ? (
            <MarkdownRenderer content={exp.description} />
          ) : (
            <p className="text-white/30 text-sm italic">No description added yet.</p>
          )}

          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors mt-4"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
            {copied ? 'Link copied!' : 'Share this page'}
          </button>
        </div>

        {/* Right — gallery (sticky on desktop, stacked on mobile) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <MediaGallery media={media} speedSeconds={exp.gallery_speed || 5} />
        </div>
      </div>
    </div>
  )
}
