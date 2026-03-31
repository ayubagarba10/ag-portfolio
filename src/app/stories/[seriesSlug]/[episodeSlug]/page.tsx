import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import EpisodeDetail from '@/components/sections/EpisodeDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seriesSlug: string; episodeSlug: string }>
}): Promise<Metadata> {
  const { episodeSlug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('stories').select('title').eq('slug', episodeSlug).single()
  if (!data) return { title: 'Stories — AG Portfolio' }
  return { title: `${data.title} — AG Portfolio` }
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ seriesSlug: string; episodeSlug: string }>
}) {
  const { seriesSlug, episodeSlug } = await params
  const supabase = createServiceClient()

  const { data: series } = await supabase
    .from('story_series')
    .select('id, title, owner_id')
    .eq('slug', seriesSlug)
    .single()

  if (!series) notFound()

  const { data: episode } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', episodeSlug)
    .eq('series_id', series.id)
    .single()

  if (!episode) notFound()

  const { data: media } = await supabase
    .from('media')
    .select('url, alt_text, media_type, source_type, external_url')
    .eq('associated_entity_type', 'story')
    .eq('associated_entity_id', episode.id)
    .order('sort_order', { ascending: true })

  supabase
    .from('page_visits')
    .insert({ page_name: `story:${seriesSlug}:${episodeSlug}`, owner_id: series.owner_id })
    .then(() => {})

  return (
    <PageShell
      title=""
      accentColor="amber-400"
      bgGradient="bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950"
    >
      <EpisodeDetail
        episode={episode}
        series={{ title: series.title, slug: seriesSlug }}
        media={media || []}
      />
    </PageShell>
  )
}
