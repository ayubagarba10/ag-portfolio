import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import ExperienceTimeline from '@/components/sections/ExperienceTimeline'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Experience — AG Portfolio',
  description: 'My professional journey and career milestones.',
}

export default async function ExperiencePage() {
  const supabase = createServiceClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id')
    .neq('name', '')
    .order('last_updated_at', { ascending: false })
    .limit(1)
    .single()

  const { data: experiences } = owner
    ? await supabase
        .from('experiences')
        .select('*')
        .eq('owner_id', owner.id)
        .order('start_date', { ascending: false })
    : { data: [] }

  if (owner) {
    supabase.from('page_visits').insert({ page_name: 'experience', owner_id: owner.id }).then(() => {})
  }

  return (
    <PageShell
      title="Experience"
      subtitle="My professional journey and career milestones."
      accentColor="violet-400"
      bgGradient="bg-gradient-to-br from-violet-950/20 via-slate-950 to-slate-950"
    >
      {experiences && experiences.length > 0 ? (
        <div className="max-w-2xl">
          <ExperienceTimeline experiences={experiences} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span className="text-2xl">💼</span>
          </div>
          <p className="text-white/30 text-sm">Experience coming soon.</p>
        </div>
      )}
    </PageShell>
  )
}
