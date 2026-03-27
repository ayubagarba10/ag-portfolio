'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Upload, ArrowRight, Check } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { setupOwnerProfile } from './actions'

type Step = 0 | 1 | 2 | 3 | 4

const STEPS = ['Photo', 'About You', 'First Project', 'Social Link', 'Done']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [loading, setLoading] = useState(false)
  const [setupError, setSetupError] = useState('')

  // Step 0: Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')

  // Step 1: Profile
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')

  // Step 2: First Project
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectLink, setProjectLink] = useState('')

  // Step 3: Social Link
  const [platform, setPlatform] = useState('')
  const [socialUrl, setSocialUrl] = useState('')

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleFinish() {
    setLoading(true)
    setSetupError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSetupError('Not signed in. Please go back to /login.')
        setLoading(false)
        return
      }

      // Upload photo
      let profileImageUrl = ''
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `profiles/${user.id}/main.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('portfolio-media')
          .upload(path, photoFile, { upsert: true })
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('portfolio-media').getPublicUrl(path)
        profileImageUrl = urlData?.publicUrl || ''
      }

      // Create/update owner profile via Server Action (uses service role to bypass RLS)
      const profileResult = await setupOwnerProfile({ name, headline, bio, profileImageUrl })
      if (profileResult.error) throw new Error(`Profile setup failed: ${profileResult.error}`)
      const owner = profileResult.data!

      // Create first project
      if (projectTitle.trim()) {
        const { error: projError } = await supabase.from('projects').insert({
          owner_id: owner.id,
          title: projectTitle,
          description: projectDesc,
          external_link: projectLink,
          slug: slugify(projectTitle) || `project-${Date.now()}`,
        })
        if (projError) throw new Error(`Project setup failed: ${projError.message}`)
      }

      // Create social link
      if (platform.trim() && socialUrl.trim()) {
        const { error: linkError } = await supabase
          .from('social_links')
          .insert({ owner_id: owner.id, platform_name: platform, url: socialUrl })
        if (linkError) throw new Error(`Social link setup failed: ${linkError.message}`)
      }

      router.push('/dashboard')
    } catch (err: any) {
      setSetupError(err?.message || 'Setup failed. Please try again.')
      setLoading(false)
    }
  }

  const canAdvance = () => {
    if (step === 0) return true
    if (step === 1) return name.trim().length > 0
    if (step === 2) return true
    if (step === 3) return true
    return true
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,41,59,0.5)_0%,_transparent_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i < step ? 'bg-white text-slate-950' :
                i === step ? 'bg-white/20 text-white border border-white/30' :
                'bg-white/5 text-white/20'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px ${i < step ? 'bg-white/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-semibold text-white mb-1">Add your photo</h2>
              <p className="text-white/40 text-sm mb-6">This will be the centrepiece of your portfolio.</p>
              <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-white/20 transition-colors bg-white/[0.02]">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/30">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Click to upload</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-1">Tell us about you</h2>
              <p className="text-white/40 text-sm mb-6">Your name and a short intro for visitors.</p>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name *" required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
              <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Headline (e.g. Software Engineer & Builder)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio about yourself…" rows={4}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-1">Add your first project</h2>
              <p className="text-white/40 text-sm mb-6">You can always add more later from the dashboard.</p>
              <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Project title"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
              <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="What does it do?" rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none" />
              <input value={projectLink} onChange={e => setProjectLink(e.target.value)} placeholder="Link (optional)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-1">Add a social link</h2>
              <p className="text-white/40 text-sm mb-6">E.g. LinkedIn, GitHub — so visitors can connect with you.</p>
              <input value={platform} onChange={e => setPlatform(e.target.value)} placeholder="Platform name (e.g. LinkedIn)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
              <input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="URL"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {setupError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 leading-snug">
            {setupError}
            {setupError.includes('schema') && (
              <a href="https://supabase.com/dashboard" target="_blank" className="block mt-1 underline text-xs text-red-300 hover:text-red-200">
                Open Supabase Dashboard →
              </a>
            )}
          </div>
        )}

        {/* Nav */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex-1 border border-white/10 text-white/50 rounded-xl py-3 text-sm hover:text-white hover:border-white/30 transition-colors">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canAdvance()}
              className="flex-1 bg-white text-slate-950 font-semibold text-sm py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30 flex items-center justify-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={loading}
              className="flex-1 bg-white text-slate-950 font-semibold text-sm py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Setting up…' : <>Launch my portfolio <Check className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
