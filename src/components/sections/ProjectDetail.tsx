'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Link2, Check } from 'lucide-react'
import MediaGallery from '@/components/ui/MediaGallery'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

interface Project {
  id: string
  title: string
  description?: string
  external_link?: string
  gallery_speed?: number
}

interface MediaItem {
  url: string
  alt_text?: string
  media_type?: string
  source_type?: string
  external_url?: string
}

export default function ProjectDetail({
  project,
  media,
}: {
  project: Project
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
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left — content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white leading-tight">{project.title}</h1>

          {project.description ? (
            <MarkdownRenderer content={project.description} />
          ) : (
            <p className="text-white/30 text-sm italic">No description added yet.</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {project.external_link && (
              <a
                href={project.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Visit Project
              </a>
            )}
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share this page'}
            </button>
          </div>
        </div>

        {/* Right — gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <MediaGallery media={media} speedSeconds={project.gallery_speed || 5} />
        </div>
      </div>
    </div>
  )
}
