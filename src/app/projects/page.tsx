import { createClient } from '@/lib/supabase/server'
import PageShell from '@/components/ui/PageShell'
import ProjectCard from '@/components/sections/ProjectCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects — AG Portfolio',
  description: 'Work I\'ve built — apps, systems, and ideas brought to life.',
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id, name')
    .limit(1)
    .single()

  const { data: projects } = owner
    ? await supabase
        .from('projects')
        .select('*, media(url, alt_text)')
        .eq('owner_id', owner.id)
        .order('sort_order', { ascending: true })
    : { data: [] }

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
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
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
