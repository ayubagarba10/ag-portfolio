import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import ProjectDetail from '@/components/sections/ProjectDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('projects').select('title').eq('slug', slug).single()
  if (!data) return { title: 'Project — AG Portfolio' }
  return { title: `${data.title} — AG Portfolio` }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) notFound()

  const { data: media } = await supabase
    .from('media')
    .select('url, alt_text, media_type, source_type, external_url')
    .eq('associated_entity_type', 'project')
    .eq('associated_entity_id', project.id)
    .order('sort_order', { ascending: true })

  supabase
    .from('page_visits')
    .insert({ page_name: `project:${slug}`, owner_id: project.owner_id })
    .then(() => {})

  return (
    <PageShell
      title=""
      accentColor="blue-400"
      bgGradient="bg-gradient-to-br from-blue-950/20 via-slate-950 to-slate-950"
    >
      <ProjectDetail project={project} media={media || []} />
    </PageShell>
  )
}
