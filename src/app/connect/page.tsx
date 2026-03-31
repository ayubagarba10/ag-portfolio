import { createServiceClient } from '@/lib/supabase/service'
import PageShell from '@/components/ui/PageShell'
import { ExternalLink } from 'lucide-react'
import ContactForm from '@/components/sections/ContactForm'
import ConnectSocialLinks from '@/components/sections/ConnectSocialLinks'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Connect — AG Portfolio',
  description: "Let's talk — find me where it matters.",
}

export default async function ConnectPage() {
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
    supabase.from('page_visits').insert({ page_name: 'connect', owner_id: owner.id }).then(() => {})
  }

  const profileImage = owner?.profile_image_url || ''

  return (
    <PageShell
      title="Connect"
      subtitle="Let's talk — find me where it matters."
      accentColor="rose-400"
      bgGradient="bg-gradient-to-br from-rose-950/20 via-slate-950 to-slate-950"
    >
      <div className={`grid gap-10 ${profileImage ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
        {/* Left — social links + contact form */}
        <div className="space-y-10">
          {/* Social links */}
          {socialLinks && socialLinks.length > 0 ? (
            <ConnectSocialLinks links={socialLinks} />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <span className="text-2xl">🔗</span>
              </div>
              <p className="text-white/30 text-sm">Social links coming soon.</p>
            </div>
          )}

          {/* Contact form */}
          {owner?.contact_email_visible !== false && (
            <div>
              <div className="mb-6 pt-6 border-t border-white/[0.06]">
                <h2 className="text-lg font-semibold text-white mb-1">Send a message</h2>
                <p className="text-white/40 text-sm">I read every message. I'll get back to you.</p>
              </div>
              <ContactForm />
            </div>
          )}
        </div>

        {/* Right — profile image (only shown if set) */}
        {profileImage && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/[0.07]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileImage}
                alt={owner?.name || 'Profile'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              {owner?.name && (
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold text-lg">{owner.name}</p>
                  {owner.headline && <p className="text-white/60 text-sm mt-0.5">{owner.headline}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
