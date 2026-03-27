import { createClient } from '@/lib/supabase/server'
import PageShell from '@/components/ui/PageShell'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connect — AG Portfolio',
  description: "Let's talk — find me where it matters.",
}

export default async function ConnectPage() {
  const supabase = await createClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id')
    .limit(1)
    .single()

  const { data: socialLinks } = owner
    ? await supabase
        .from('social_links')
        .select('*')
        .eq('owner_id', owner.id)
        .order('sort_order', { ascending: true })
    : { data: [] }

  if (owner) {
    supabase.from('page_visits').insert({ page_name: 'connect', owner_id: owner.id }).then(() => {})
  }

  return (
    <PageShell
      title="Connect"
      subtitle="Let's talk — find me where it matters."
      accentColor="rose-400"
      bgGradient="bg-gradient-to-br from-rose-950/20 via-slate-950 to-slate-950"
    >
      {socialLinks && socialLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {socialLinks.map((link: { id: string; platform_name: string; url: string }) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-6 py-5 hover:border-rose-500/30 hover:bg-white/[0.06] transition-all duration-300"
            >
              <span className="font-medium text-white group-hover:text-rose-300 transition-colors">
                {link.platform_name}
              </span>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-rose-400 transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <p className="text-white/30 text-sm">Links coming soon.</p>
        </div>
      )}
    </PageShell>
  )
}
