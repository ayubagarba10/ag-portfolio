import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import ProjectCard from '@/components/sections/ProjectCard'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects — AG Portfolio',
  description: 'Work I\'ve built — apps, systems, and ideas brought to life.',
}

export default async function ProjectsPage() {
  const supabase = createServiceClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id, name')
    .neq('name', '')
    .order('last_updated_at', { ascending: false })
    .limit(1)
    .single()

  const { data: projects } = owner
    ? await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', owner.id)
        .order('sort_order', { ascending: true })
    : { data: [] }

  // Fetch media separately — no direct FK exists between projects and media
  // (polymorphic association via associated_entity_type / associated_entity_id)
  const projectIds = projects?.map(p => p.id) || []
  const { data: projectMedia } = projectIds.length > 0
    ? await supabase
        .from('media')
        .select('url, alt_text, associated_entity_id')
        .eq('associated_entity_type', 'project')
        .in('associated_entity_id', projectIds)
    : { data: [] }

  const projectsWithMedia = projects?.map(p => ({
    ...p,
    media: projectMedia?.filter(m => m.associated_entity_id === p.id) || [],
  })) || []

  // Track visit (fire-and-forget on server)
  if (owner) {
    supabase.from('page_visits').insert({ page_name: 'projects', owner_id: owner.id }).then(() => {})
  }

  return (
    <PageShell
      title="Projects"
      subtitle="Work I've built — apps, systems, and ideas brought to life."
      accentColor="blue-400"
      bgGradient="bg-gradient-to-br from-blue-950/20 via-slate-950 to-slate-950"
    >
      {projectsWithMedia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectsWithMedia.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <p className="text-white/30 text-sm">Projects coming soon.</p>
        </div>
      )}
    </PageShell>
  )
}
