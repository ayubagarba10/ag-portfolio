import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import StoriesClient from './StoriesClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Stories — AG Portfolio',
  description: 'Personal moments, reflections, and life beyond work.',
}

export default async function StoriesPage() {
  const supabase = createServiceClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id')
    .neq('name', '')
    .order('last_updated_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch story series
  const { data: series } = owner
    ? await supabase
        .from('story_series')
        .select('*')
        .eq('owner_id', owner.id)
        .order('sort_order', { ascending: true })
    : { data: [] }

  // Count episodes per series
  const seriesIds = series?.map(s => s.id) || []
  const seriesWithCount = await Promise.all(
    (series || []).map(async s => {
      const { count } = await supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('series_id', s.id)
      return { ...s, episode_count: count ?? 0 }
    })
  )

  // Fetch standalone stories (no series)
  const { data: standalone } = owner
    ? await supabase
        .from('stories')
        .select('*')
        .eq('owner_id', owner.id)
        .is('series_id', null)
        .order('created_at', { ascending: false })
    : { data: [] }

  const standaloneIds = standalone?.map(s => s.id) || []
  const { data: standaloneMedia } = standaloneIds.length > 0
    ? await supabase
        .from('media')
        .select('url, alt_text, source_type, external_url, associated_entity_id')
        .eq('associated_entity_type', 'story')
        .in('associated_entity_id', standaloneIds)
        .order('sort_order', { ascending: true })
    : { data: [] }

  const standaloneWithMedia = (standalone || []).map(s => ({
    ...s,
    media: standaloneMedia?.filter(m => m.associated_entity_id === s.id) || [],
  }))

  if (owner) {
    supabase.from('page_visits').insert({ page_name: 'stories', owner_id: owner.id }).then(() => {})
  }

  return (
    <PageShell
      title="Stories"
      subtitle="Personal moments, reflections, and life beyond work."
      accentColor="amber-400"
      bgGradient="bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950"
    >
      <StoriesClient series={seriesWithCount} standalone={standaloneWithMedia} />
    </PageShell>
  )
}
