'use client'

import { useState } from 'react'
import StorySeriesCard from '@/components/sections/StorySeriesCard'
import StoryPost from '@/components/sections/StoryPost'

interface Series {
  id: string
  title: string
  description?: string
  preview_text?: string
  slug: string
  cover_image_url?: string
  episode_count?: number
}

interface Story {
  id: string
  title: string
  content?: string
  slug: string
  created_at: string
  media?: { url: string; alt_text: string; source_type?: string; external_url?: string }[]
}

export default function StoriesClient({
  series,
  standalone,
}: {
  series: Series[]
  standalone: Story[]
}) {
  const [tab, setTab] = useState<'series' | 'articles'>(series.length > 0 ? 'series' : 'articles')
  const isEmpty = series.length === 0 && standalone.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <span className="text-2xl">📖</span>
        </div>
        <p className="text-white/30 text-sm">Stories coming soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Tab switcher — only show if both types exist */}
      {series.length > 0 && standalone.length > 0 && (
        <div className="flex gap-1 p-0.5 rounded-xl bg-white/5 w-fit">
          {(['series', 'articles'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                tab === t ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t === 'series' ? 'Series & Episodes' : 'Articles'}
            </button>
          ))}
        </div>
      )}

      {/* Series tab */}
      {(tab === 'series' || standalone.length === 0) && series.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {series.map((s, i) => (
            <StorySeriesCard key={s.id} series={s} index={i} />
          ))}
        </div>
      )}

      {/* Articles tab */}
      {(tab === 'articles' || series.length === 0) && standalone.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standalone.map((story, i) => (
            <StoryPost key={story.id} story={story} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
