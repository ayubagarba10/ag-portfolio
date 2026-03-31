import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import ExperienceDetail from '@/components/sections/ExperienceDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('experiences')
    .select('role, company')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Experience — AG Portfolio' }
  return { title: `${data.role} at ${data.company} — AG Portfolio` }
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: experience } = await supabase
    .from('experiences')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!experience) notFound()

  const { data: media } = await supabase
    .from('media')
    .select('url, alt_text, media_type, source_type, external_url')
    .eq('associated_entity_type', 'experience')
    .eq('associated_entity_id', experience.id)
    .order('sort_order', { ascending: true })

  supabase
    .from('page_visits')
    .insert({ page_name: `experience:${slug}`, owner_id: experience.owner_id })
    .then(() => {})

  return (
    <PageShell
      title=""
      accentColor="violet-400"
      bgGradient="bg-gradient-to-br from-violet-950/20 via-slate-950 to-slate-950"
    >
      <ExperienceDetail experience={experience} media={media || []} />
    </PageShell>
  )
}
