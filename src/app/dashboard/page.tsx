'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  LogOut, Plus, Trash2, Edit3, ExternalLink, Upload, Sparkles, Copy, Check,
  BarChart2, Gift, Briefcase
} from 'lucide-react'
import { slugify } from '@/lib/utils'
import Image from 'next/image'

type Tab = 'profile' | 'projects' | 'experience' | 'stories' | 'analytics'

interface OwnerProfile {
  id: string
  name: string
  headline: string
  bio: string
  profile_image_url: string
}

// ─── AI Suggest Button ────────────────────────────────────────────────────────
function AISuggestButton({
  text,
  context,
  onAccept,
}: {
  text: string
  context: string
  onAccept: (s: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')

  async function suggest() {
    if (!text.trim()) return
    setLoading(true)
    const res = await fetch('/api/ai-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original: text, context }),
    })
    const data = await res.json()
    setSuggestion(data.suggestion || '')
    setLoading(false)
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={suggest}
        disabled={loading || !text.trim()}
        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-40"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {loading ? 'Thinking…' : 'AI Suggest'}
      </button>
      {suggestion && (
        <div className="mt-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs text-white/70 leading-relaxed">
          <p className="mb-2">{suggestion}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { onAccept(suggestion); setSuggestion('') }}
              className="text-violet-400 hover:text-violet-300 font-medium"
            >Accept</button>
            <button
              type="button"
              onClick={() => setSuggestion('')}
              className="text-white/30 hover:text-white/50"
            >Dismiss</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Copy Link Button ─────────────────────────────────────────────────────────
function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    const url = `${window.location.origin}${path}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('profile')
  const [owner, setOwner] = useState<OwnerProfile | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<{ page_name: string; count: number }[]>([])
  const [giftCount, setGiftCount] = useState(0)

  // Profile form
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // New project form
  const [showNewProject, setShowNewProject] = useState(false)
  const [pTitle, setPTitle] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pLink, setPLink] = useState('')

  // New experience form
  const [showNewExp, setShowNewExp] = useState(false)
  const [eRole, setERole] = useState('')
  const [eCompany, setECompany] = useState('')
  const [eDesc, setEDesc] = useState('')
  const [eStart, setEStart] = useState('')
  const [eEnd, setEEnd] = useState('')
  const [eCurrent, setECurrent] = useState(false)

  // New story form
  const [showNewStory, setShowNewStory] = useState(false)
  const [sTitle, setSTitle] = useState('')
  const [sContent, setSContent] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: p } = await supabase.from('owner_profiles').select('*').eq('user_id', user.id).single()
    if (p) {
      setOwner(p)
      setName(p.name || '')
      setHeadline(p.headline || '')
      setBio(p.bio || '')

      // Load content
      const [{ data: proj }, { data: exp }, { data: st }] = await Promise.all([
        supabase.from('projects').select('*').eq('owner_id', p.id).order('sort_order'),
        supabase.from('experiences').select('*').eq('owner_id', p.id).order('start_date', { ascending: false }),
        supabase.from('stories').select('*').eq('owner_id', p.id).order('created_at', { ascending: false }),
      ])
      setProjects(proj || [])
      setExperiences(exp || [])
      setStories(st || [])

      // Analytics
      const { data: visits } = await supabase.from('page_visits').select('page_name').eq('owner_id', p.id)
      if (visits) {
        const counts: Record<string, number> = {}
        visits.forEach(v => { counts[v.page_name] = (counts[v.page_name] || 0) + 1 })
        setAnalytics(Object.entries(counts).map(([page_name, count]) => ({ page_name, count })))
      }
      const { count } = await supabase.from('gift_messages').select('*', { count: 'exact', head: true }).eq('owner_id', p.id)
      setGiftCount(count || 0)
    }
  }

  function showError(msg: string) {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 4000)
  }

  async function saveProfile() {
    if (!owner) {
      showError('Profile not loaded — please run the Supabase schema first.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('owner_profiles')
        .update({ name, headline, bio, last_updated_at: new Date().toISOString() })
        .eq('id', owner.id)
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      showError(err?.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !owner) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `profiles/${user.id}/main.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path)
      if (!data?.publicUrl) throw new Error('Could not get public URL')
      const { error: updateError } = await supabase
        .from('owner_profiles')
        .update({ profile_image_url: data.publicUrl })
        .eq('id', owner.id)
      if (updateError) throw updateError
      setOwner({ ...owner, profile_image_url: data.publicUrl })
    } catch (err: any) {
      showError(err?.message || 'Photo upload failed.')
    }
  }

  async function addProject() {
    if (!owner || !pTitle.trim()) return
    try {
      const { error } = await supabase.from('projects').insert({
        owner_id: owner.id,
        title: pTitle,
        description: pDesc,
        external_link: pLink,
        slug: slugify(pTitle) || `project-${Date.now()}`,
      })
      if (error) throw error
      setPTitle(''); setPDesc(''); setPLink('')
      setShowNewProject(false)
      loadAll()
    } catch (err: any) {
      showError(err?.message || 'Failed to add project.')
    }
  }

  async function deleteProject(id: string) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      setProjects(projects.filter(p => p.id !== id))
    } catch (err: any) {
      showError(err?.message || 'Failed to delete project.')
    }
  }

  async function addExperience() {
    if (!owner || !eRole.trim() || !eCompany.trim()) return
    try {
      const { error } = await supabase.from('experiences').insert({
        owner_id: owner.id,
        role: eRole,
        company: eCompany,
        description: eDesc,
        start_date: eStart || null,
        end_date: eCurrent ? null : (eEnd || null),
        is_current: eCurrent,
      })
      if (error) throw error
      setERole(''); setECompany(''); setEDesc(''); setEStart(''); setEEnd(''); setECurrent(false)
      setShowNewExp(false)
      loadAll()
    } catch (err: any) {
      showError(err?.message || 'Failed to add experience.')
    }
  }

  async function deleteExperience(id: string) {
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', id)
      if (error) throw error
      setExperiences(experiences.filter(e => e.id !== id))
    } catch (err: any) {
      showError(err?.message || 'Failed to delete experience.')
    }
  }

  async function addStory() {
    if (!owner || !sTitle.trim()) return
    try {
      const { error } = await supabase.from('stories').insert({
        owner_id: owner.id,
        title: sTitle,
        content: sContent,
        slug: slugify(sTitle) || `story-${Date.now()}`,
      })
      if (error) throw error
      setSTitle(''); setSContent('')
      setShowNewStory(false)
      loadAll()
    } catch (err: any) {
      showError(err?.message || 'Failed to add story.')
    }
  }

  async function deleteStory(id: string) {
    try {
      const { error } = await supabase.from('stories').delete().eq('id', id)
      if (error) throw error
      setStories(stories.filter(s => s.id !== id))
    } catch (err: any) {
      showError(err?.message || 'Failed to delete story.')
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch (_) {
      // ignore signOut errors — still navigate away
    }
    // Full page reload clears all auth state (SSR cookies + client storage)
    window.location.href = '/'
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'stories', label: 'Stories' },
    { id: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Error toast */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-sm max-w-sm text-center">
          {errorMsg}
        </div>
      )}

      {/* Schema setup banner — shown when profile can't load */}
      {!owner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 text-center text-xs text-amber-300">
          ⚠ Database tables not found. Please run{' '}
          <code className="font-mono bg-amber-500/10 px-1 rounded">supabase/schema.sql</code>{' '}
          in your{' '}
          <a href="https://supabase.com/dashboard" target="_blank" className="underline hover:text-amber-200">
            Supabase SQL Editor
          </a>
          , then refresh.
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 md:px-10 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-white text-base">Dashboard</h1>
          <p className="text-white/30 text-xs">Manage your portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" /> View site
          </a>
          <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar tabs */}
        <nav className="w-44 border-r border-white/[0.06] min-h-[calc(100vh-57px)] p-4 space-y-1 hidden md:block">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 px-6 pt-4 overflow-x-auto w-full">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/40'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 max-w-3xl">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {/* ── PROFILE TAB ─────────────────────────────────── */}
            {tab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white">Profile</h2>

                {/* Photo */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 flex-shrink-0">
                    {owner?.profile_image_url ? (
                      <Image src={owner.profile_image_url} alt="Profile" width={64} height={64} className="object-cover object-top w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">?</div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
                      <Upload className="w-4 h-4" /> Replace photo
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
                  </label>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Headline</label>
                    <input value={headline} onChange={e => setHeadline(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
                    <AISuggestButton text={headline} context="professional headline for a portfolio website" onAccept={setHeadline} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none" />
                    <AISuggestButton text={bio} context="personal bio for a portfolio website" onAccept={setBio} />
                  </div>
                </div>

                <button onClick={saveProfile} disabled={saving}
                  className="px-5 py-2.5 bg-white text-slate-950 text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saved ? <><Check className="w-4 h-4 text-emerald-600" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
                </button>

                {/* Deep links */}
                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Shareable links</p>
                  {['/projects', '/experience', '/about', '/stories'].map(p => (
                    <div key={p} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
                      <span className="text-xs text-white/40">{p}</span>
                      <CopyLink path={p} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PROJECTS TAB ────────────────────────────────── */}
            {tab === 'projects' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Projects <span className="text-white/30 text-sm font-normal ml-1">({projects.length})</span></h2>
                  <button onClick={() => setShowNewProject(true)} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {showNewProject && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-medium text-white mb-3">New project</h3>
                    <input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Title *"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                    <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Description" rows={3}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 resize-none" />
                    <AISuggestButton text={pDesc} context="project description for a portfolio website" onAccept={setPDesc} />
                    <input value={pLink} onChange={e => setPLink(e.target.value)} placeholder="External link (optional)"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                    <div className="flex gap-2 pt-1">
                      <button onClick={addProject} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                      <button onClick={() => setShowNewProject(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                    </div>
                  </div>
                )}

                {projects.map((p) => (
                  <div key={p.id} className="flex items-start justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{p.title}</p>
                      {p.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{p.description}</p>}
                      {p.external_link && (
                        <a href={p.external_link} target="_blank" className="text-blue-400 text-xs flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" /> {p.external_link}
                        </a>
                      )}
                    </div>
                    <button onClick={() => deleteProject(p.id)} className="text-white/20 hover:text-red-400 transition-colors ml-3 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {projects.length === 0 && !showNewProject && (
                  <p className="text-white/20 text-sm text-center py-10">No projects yet. Add your first one!</p>
                )}
              </div>
            )}

            {/* ── EXPERIENCE TAB ──────────────────────────────── */}
            {tab === 'experience' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Experience</h2>
                  <button onClick={() => setShowNewExp(true)} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {showNewExp && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-medium text-white mb-3">New experience</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={eRole} onChange={e => setERole(e.target.value)} placeholder="Role *"
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                      <input value={eCompany} onChange={e => setECompany(e.target.value)} placeholder="Company *"
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                    </div>
                    <textarea value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Description" rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 resize-none" />
                    <AISuggestButton text={eDesc} context="professional role description for a portfolio/resume" onAccept={setEDesc} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={eStart} onChange={e => setEStart(e.target.value)}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-white/30" />
                      {!eCurrent && (
                        <input type="date" value={eEnd} onChange={e => setEEnd(e.target.value)}
                          className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-white/30" />
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer">
                      <input type="checkbox" checked={eCurrent} onChange={e => setECurrent(e.target.checked)} className="accent-violet-500" />
                      Current role
                    </label>
                    <div className="flex gap-2 pt-1">
                      <button onClick={addExperience} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                      <button onClick={() => setShowNewExp(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                    </div>
                  </div>
                )}

                {experiences.map((e) => (
                  <div key={e.id} className="flex items-start justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                    <div>
                      <p className="font-medium text-white text-sm">{e.role}</p>
                      <p className="text-violet-400 text-xs">{e.company}</p>
                      {e.description && <p className="text-white/40 text-xs mt-1 line-clamp-2">{e.description}</p>}
                    </div>
                    <button onClick={() => deleteExperience(e.id)} className="text-white/20 hover:text-red-400 transition-colors ml-3">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {experiences.length === 0 && !showNewExp && (
                  <p className="text-white/20 text-sm text-center py-10">No experience yet.</p>
                )}
              </div>
            )}

            {/* ── STORIES TAB ─────────────────────────────────── */}
            {tab === 'stories' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Stories</h2>
                  <button onClick={() => setShowNewStory(true)} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {showNewStory && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-medium text-white mb-3">New story</h3>
                    <input value={sTitle} onChange={e => setSTitle(e.target.value)} placeholder="Title *"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                    <textarea value={sContent} onChange={e => setSContent(e.target.value)} placeholder="Tell your story…" rows={5}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 resize-none" />
                    <AISuggestButton text={sContent} context="personal story or social life post for a portfolio website" onAccept={setSContent} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={addStory} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                      <button onClick={() => setShowNewStory(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                    </div>
                  </div>
                )}

                {stories.map((s) => (
                  <div key={s.id} className="flex items-start justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                    <div>
                      <p className="font-medium text-white text-sm">{s.title}</p>
                      {s.content && <p className="text-white/40 text-xs mt-1 line-clamp-2">{s.content}</p>}
                    </div>
                    <button onClick={() => deleteStory(s.id)} className="text-white/20 hover:text-red-400 transition-colors ml-3">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {stories.length === 0 && !showNewStory && (
                  <p className="text-white/20 text-sm text-center py-10">No stories yet.</p>
                )}
              </div>
            )}

            {/* ── ANALYTICS TAB ───────────────────────────────── */}
            {tab === 'analytics' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white">Analytics</h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-center">
                    <Briefcase className="w-5 h-5 text-white/30 mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-white">{projects.length}</p>
                    <p className="text-xs text-white/30 mt-0.5">Projects</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-center">
                    <BarChart2 className="w-5 h-5 text-white/30 mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-white">{analytics.reduce((a, b) => a + b.count, 0)}</p>
                    <p className="text-xs text-white/30 mt-0.5">Page views</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-center">
                    <Gift className="w-5 h-5 text-white/30 mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-white">{giftCount}</p>
                    <p className="text-xs text-white/30 mt-0.5">Gift opens</p>
                  </div>
                </div>

                {analytics.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Views by page</p>
                    <div className="space-y-3">
                      {analytics.sort((a, b) => b.count - a.count).map(({ page_name, count }) => {
                        const max = Math.max(...analytics.map(a => a.count))
                        return (
                          <div key={page_name}>
                            <div className="flex justify-between text-xs text-white/50 mb-1">
                              <span>/{page_name}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / max) * 100}%` }}
                                transition={{ duration: 0.6 }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </main>
      </div>
    </div>
  )
}
