import { createClient } from '@/lib/supabase/server'
import PageShell from '@/components/ui/PageShell'
import StoryPost from '@/components/sections/StoryPost'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Stories — AG Portfolio',
  description: 'Personal moments, reflections, and life beyond work.',
}

export default async function StoriesPage() {
  const supabase = await createClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id')
    .limit(1)
    .single()

  const { data: stories } = owner
    ? await supabase
        .from('stories')
        .select('*')
        .eq('owner_id', owner.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Fetch media separately — no direct FK exists between stories and media
  // (polymorphic association via associated_entity_type / associated_entity_id)
  const storyIds = stories?.map(s => s.id) || []
  const { data: storyMedia } = storyIds.length > 0
    ? await supabase
        .from('media')
        .select('url, alt_text, associated_entity_id')
        .eq('associated_entity_type', 'story')
        .in('associated_entity_id', storyIds)
    : { data: [] }

  const storiesWithMedia = stories?.map(s => ({
    ...s,
    media: storyMedia?.filter(m => m.associated_entity_id === s.id) || [],
  })) || []

  // Track visit (fire-and-forget on server)
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
      {storiesWithMedia.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {storiesWithMedia.map((story, i) => (
            <StoryPost key={story.id} story={story} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span className="text-2xl">📖</span>
          </div>
          <p className="text-white/30 text-sm">Stories coming soon.</p>
        </div>
      )}
    </PageShell>
  )
}
