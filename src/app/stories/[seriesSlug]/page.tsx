import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import StoryEpisodeCard from '@/components/sections/StoryEpisodeCard'
import MediaGallery from '@/components/ui/MediaGallery'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ seriesSlug: string }> }): Promise<Metadata> {
  const { seriesSlug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('story_series').select('title').eq('slug', seriesSlug).single()
  if (!data) return { title: 'Stories — AG Portfolio' }
  return { title: `${data.title} — AG Portfolio` }
}

export default async function SeriesPage({ params }: { params: Promise<{ seriesSlug: string }> }) {
  const { seriesSlug } = await params
  const supabase = createServiceClient()

  const { data: series } = await supabase
    .from('story_series')
    .select('*')
    .eq('slug', seriesSlug)
    .single()

  if (!series) notFound()

  const [{ data: episodes }, { data: seriesMedia }] = await Promise.all([
    supabase
      .from('stories')
      .select('*')
      .eq('series_id', series.id)
      .order('episode_number', { ascending: true, nullsFirst: false }),
    supabase
      .from('media')
      .select('*')
      .eq('associated_entity_type', 'series')
      .eq('associated_entity_id', series.id)
      .order('sort_order', { ascending: true }),
  ])

  supabase
    .from('page_visits')
    .insert({ page_name: `story-series:${seriesSlug}`, owner_id: series.owner_id })
    .then(() => {})

  const hasGallery = seriesMedia && seriesMedia.length > 0
  const hasDescription = series.description && series.description.trim()

  return (
    <PageShell
      title={series.title}
      subtitle={hasDescription ? '' : (series.preview_text || '')}
      accentColor="amber-400"
      bgGradient="bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950"
    >
      <div className="max-w-6xl">
        {/* Two-column layout: left = content+episodes, right = gallery */}
        <div className={`grid gap-10 ${hasGallery ? 'grid-cols-1 lg:grid-cols-[3fr_2fr]' : 'grid-cols-1 max-w-2xl'}`}>

          {/* Left column */}
          <div className="space-y-6">
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Stories
            </Link>

            {/* Series description rendered as Markdown */}
            {hasDescription && (
              <div className="pb-2">
                <MarkdownRenderer content={series.description} />
              </div>
            )}

            {/* Episode list */}
            {episodes && episodes.length > 0 ? (
              <div className="space-y-3">
                {episodes.map((ep, i) => (
                  <StoryEpisodeCard key={ep.id} episode={ep} seriesSlug={seriesSlug} index={i} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-white/30 text-sm">No episodes yet.</p>
              </div>
            )}
          </div>

          {/* Right column — gallery (only if series has media) */}
          {hasGallery && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <MediaGallery media={seriesMedia} speedSeconds={5} />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
