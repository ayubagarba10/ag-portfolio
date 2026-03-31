import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import StoryDetail from '@/components/sections/StoryDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('stories').select('title').eq('slug', slug).single()
  if (!data) return { title: 'Stories — AG Portfolio' }
  return { title: `${data.title} — AG Portfolio` }
}

export default async function StoryPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id')
    .neq('name', '')
    .order('last_updated_at', { ascending: false })
    .limit(1)
    .single()

  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .is('series_id', null)
    .single()

  if (!story) notFound()

  const { data: media } = await supabase
    .from('media')
    .select('url, alt_text, media_type, source_type, external_url')
    .eq('associated_entity_type', 'story')
    .eq('associated_entity_id', story.id)
    .order('sort_order', { ascending: true })

  if (owner) {
    supabase
      .from('page_visits')
      .insert({ page_name: `story:${slug}`, owner_id: owner.id })
      .then(() => {})
  }

  return (
    <PageShell
      title=""
      accentColor="amber-400"
      bgGradient="bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950"
    >
      <StoryDetail story={story} media={media || []} />
    </PageShell>
  )
}
