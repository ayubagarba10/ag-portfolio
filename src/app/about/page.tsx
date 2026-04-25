import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import Image from 'next/image'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About — AG Portfolio',
  description: 'Who I am beyond the resume.',
}

export default async function AboutPage() {
  const supabase = createServiceClient()

  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('*')
    .neq('name', '')
    .order('last_updated_at', { ascending: false })
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
    supabase.from('page_visits').insert({ page_name: 'about', owner_id: owner.id }).then(() => {})
  }

  return (
    <PageShell
      title="About"
      subtitle="Who I am beyond the resume."
      accentColor="emerald-400"
      bgGradient="bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950"
    >
      <div className="max-w-3xl">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Photo */}
          {owner?.profile_image_url && (
            <div className="flex-shrink-0">
              <div className="w-40 h-52 md:w-52 md:h-64 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src={owner.profile_image_url}
                  alt={owner.name || 'Profile'}
                  width={208}
                  height={256}
                  className="object-cover object-top w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-1">{owner?.name || ''}</h2>
            {owner?.headline && (
              <p className="text-emerald-400 text-sm mb-5">{owner.headline}</p>
            )}
            {owner?.bio ? (
              <MarkdownRenderer content={owner.bio} className="text-sm md:text-base" />
            ) : (
              <p className="text-white/20 text-sm italic">Bio coming soon.</p>
            )}

            {owner?.personal_story && (
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <MarkdownRenderer content={owner.personal_story} className="text-sm md:text-base" />
              </div>
            )}

            {/* Social links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={/^https?:\/\//i.test(link.url) ? link.url : 'https://' + link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/30 transition-all"
                  >
                    {link.platform_name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
