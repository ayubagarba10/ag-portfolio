'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  LogOut, Plus, Trash2, ExternalLink, Upload, Sparkles, Copy, Check,
  BarChart2, Gift, Briefcase, Loader2, Pencil, MessageSquare, RefreshCw,
} from 'lucide-react'
import { slugify } from '@/lib/utils'
import Image from 'next/image'
import { ensureOwnerProfile } from './actions'
import MediaInputPanel from '@/components/ui/MediaInputPanel'
import AIEnhanceButton from '@/components/ui/AIEnhanceButton'

type Tab = 'profile' | 'projects' | 'experience' | 'stories' | 'social' | 'media' | 'analytics' | 'messages'

interface OwnerProfile {
  id: string
  name: string
  headline: string
  bio: string
  personal_story: string
  contact_email_visible: boolean
  use_image_on_landing: boolean
  profile_image_url: string
  onboarding_complete: boolean
}

// ─── AI Suggest Button (existing inline, for 'improve' type) ────────────────
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
  async function share() {
    const url = `${window.location.origin}${path}`
    if (navigator.share) {
      try { await navigator.share({ url }); return } catch {}
    }
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={share} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

// ─── Gallery Speed Slider ────────────────────────────────────────────────────
function GallerySpeedSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-white/40">Gallery speed</label>
        <span className="text-xs text-white/50">{value}s per image</span>
      </div>
      <input
        type="range"
        min={2}
        max={15}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-violet-500"
      />
      <div className="flex justify-between text-[10px] text-white/20">
        <span>Fast (2s)</span>
        <span>Slow (15s)</span>
      </div>
    </div>
  )
}

// ─── Media Mini Grid ─────────────────────────────────────────────────────────
function MediaMiniGrid({
  media,
  onDelete,
  onReplace,
}: {
  media: any[]
  onDelete: (id: string, url: string) => void
  onReplace: (id: string, oldUrl: string) => void
}) {
  if (media.length === 0) return <p className="text-xs text-white/20 py-2">No images yet.</p>
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {media.map((m) => {
        const src = m.source_type === 'external_link' && m.external_url ? m.external_url : m.url
        return (
          <div key={m.id} className="relative group aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/[0.06]">
            {m.media_type === 'video' ? (
              <video src={src} className="w-full h-full object-cover" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={m.alt_text || ''} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onReplace(m.id, m.url)}
                className="text-amber-400 hover:text-amber-300"
                title="Replace"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(m.id, m.url)}
                className="text-red-400 hover:text-red-300"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const supabase = createClient()
  useRouter()

  const [tab, setTab] = useState<Tab>('profile')
  const [owner, setOwner] = useState<OwnerProfile | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [storySeries, setStorySeries] = useState<any[]>([])
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<{ page_name: string; count: number }[]>([])
  const [giftCount, setGiftCount] = useState(0)

  // Per-entity media maps
  const [expMediaMap, setExpMediaMap] = useState<Record<string, any[]>>({})
  const [projMediaMap, setProjMediaMap] = useState<Record<string, any[]>>({})
  const [storyMediaMap, setStoryMediaMap] = useState<Record<string, any[]>>({})

  // Profile form
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [personalStory, setPersonalStory] = useState('')
  const [contactEmailVisible, setContactEmailVisible] = useState(true)
  const [useImageOnLanding, setUseImageOnLanding] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Contact messages
  const [messages, setMessages] = useState<any[]>([])

  // New project form
  const [showNewProject, setShowNewProject] = useState(false)
  const [pTitle, setPTitle] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pLink, setPLink] = useState('')
  const [pPreviewText, setPPreviewText] = useState('')
  const [pGallerySpeed, setPGallerySpeed] = useState(5)

  // New experience form
  const [showNewExp, setShowNewExp] = useState(false)
  const [eRole, setERole] = useState('')
  const [eCompany, setECompany] = useState('')
  const [eDesc, setEDesc] = useState('')
  const [eStart, setEStart] = useState('')
  const [eEnd, setEEnd] = useState('')
  const [eCurrent, setECurrent] = useState(false)
  const [ePreviewText, setEPreviewText] = useState('')
  const [eGallerySpeed, setEGallerySpeed] = useState(5)

  // New story form
  const [showNewStory, setShowNewStory] = useState(false)
  const [sTitle, setSTitle] = useState('')
  const [sContent, setSContent] = useState('')
  const [sSeriesId, setSSeriesId] = useState('')
  const [sEpisodeNum, setSEpisodeNum] = useState('')
  const [sPreviewText, setSPreviewText] = useState('')

  // New series form
  const [showNewSeries, setShowNewSeries] = useState(false)
  const [ssTitle, setSsTitle] = useState('')
  const [ssDesc, setSsDesc] = useState('')
  const [ssPreviewText, setSsPreviewText] = useState('')

  // New social link form
  const [showNewSocial, setShowNewSocial] = useState(false)
  const [slPlatform, setSlPlatform] = useState('')
  const [slUrl, setSlUrl] = useState('')

  // Photo upload loading
  const [photoUploading, setPhotoUploading] = useState(false)

  // Edit project state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [epTitle, setEpTitle] = useState('')
  const [epDesc, setEpDesc] = useState('')
  const [epLink, setEpLink] = useState('')
  const [epPreviewText, setEpPreviewText] = useState('')
  const [epGallerySpeed, setEpGallerySpeed] = useState(5)

  // Edit experience state
  const [editingExpId, setEditingExpId] = useState<string | null>(null)
  const [eeRole, setEeRole] = useState('')
  const [eeCompany, setEeCompany] = useState('')
  const [eeDesc, setEeDesc] = useState('')
  const [eeStart, setEeStart] = useState('')
  const [eeEnd, setEeEnd] = useState('')
  const [eeCurrent, setEeCurrent] = useState(false)
  const [eePreviewText, setEePreviewText] = useState('')
  const [eeGallerySpeed, setEeGallerySpeed] = useState(5)
  const [eeSlug, setEeSlug] = useState('')

  // Edit story state
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null)
  const [esTitle, setEsTitle] = useState('')
  const [esContent, setEsContent] = useState('')
  const [esSeriesId, setEsSeriesId] = useState('')
  const [esEpisodeNum, setEsEpisodeNum] = useState('')
  const [esPreviewText, setEsPreviewText] = useState('')

  // Edit series state
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null)
  const [essTitle, setEssTitle] = useState('')
  const [essDesc, setEssDesc] = useState('')
  const [essPreviewText, setEssPreviewText] = useState('')

  // Media state (general media tab)
  const [media, setMedia] = useState<any[]>([])
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaAltText, setMediaAltText] = useState('')

  // Replace media state
  const [replacingMediaId, setReplacingMediaId] = useState<string | null>(null)
  const [replacingMediaOldUrl, setReplacingMediaOldUrl] = useState('')
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [replaceUrl, setReplaceUrl] = useState('')
  const [replacing, setReplacing] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setInitializing(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setInitializing(false); return }

    let { data: p } = await supabase.from('owner_profiles').select('*').eq('user_id', user.id).single()

    if (!p) {
      const created = await ensureOwnerProfile()
      if (created) {
        const { data: refetched } = await supabase.from('owner_profiles').select('*').eq('id', created.id).single()
        p = refetched
      }
    }

    if (p) {
      setOwner(p)
      setName(p.name || '')
      setHeadline(p.headline || '')
      setBio(p.bio || '')
      setPersonalStory(p.personal_story || '')
      setContactEmailVisible(p.contact_email_visible !== false)
      setUseImageOnLanding(p.use_image_on_landing !== false)

      const [{ data: proj }, { data: exp }, { data: st }, { data: sl }, { data: med }, { data: series }, { data: allMedia }] = await Promise.all([
        supabase.from('projects').select('*').eq('owner_id', p.id).order('sort_order'),
        supabase.from('experiences').select('*').eq('owner_id', p.id).order('start_date', { ascending: false }),
        supabase.from('stories').select('*').eq('owner_id', p.id).order('created_at', { ascending: false }),
        supabase.from('social_links').select('*').eq('owner_id', p.id).order('sort_order'),
        supabase.from('media').select('*').eq('owner_id', p.id).order('uploaded_at', { ascending: false }),
        supabase.from('story_series').select('*').eq('owner_id', p.id).order('sort_order'),
        supabase.from('media').select('*').eq('owner_id', p.id).order('sort_order', { ascending: true }),
      ])

      setProjects(proj || [])
      setExperiences(exp || [])
      setStories(st || [])
      setSocialLinks(sl || [])
      setMedia(med || [])
      setStorySeries(series || [])

      // Build per-entity media maps
      if (allMedia) {
        const expMap: Record<string, any[]> = {}
        const projMap: Record<string, any[]> = {}
        const storyMap: Record<string, any[]> = {}
        allMedia.forEach(m => {
          if (m.associated_entity_type === 'experience' && m.associated_entity_id) {
            if (!expMap[m.associated_entity_id]) expMap[m.associated_entity_id] = []
            expMap[m.associated_entity_id].push(m)
          } else if (m.associated_entity_type === 'project' && m.associated_entity_id) {
            if (!projMap[m.associated_entity_id]) projMap[m.associated_entity_id] = []
            projMap[m.associated_entity_id].push(m)
          } else if (m.associated_entity_type === 'story' && m.associated_entity_id) {
            if (!storyMap[m.associated_entity_id]) storyMap[m.associated_entity_id] = []
            storyMap[m.associated_entity_id].push(m)
          }
        })
        setExpMediaMap(expMap)
        setProjMediaMap(projMap)
        setStoryMediaMap(storyMap)
      }

      fetch('/api/messages')
        .then(r => r.ok ? r.json() : [])
        .then(msgs => setMessages(msgs || []))
        .catch(() => {})

      const { data: visits } = await supabase.from('page_visits').select('page_name').eq('owner_id', p.id)
      if (visits) {
        const counts: Record<string, number> = {}
        visits.forEach(v => { counts[v.page_name] = (counts[v.page_name] || 0) + 1 })
        setAnalytics(Object.entries(counts).map(([page_name, count]) => ({ page_name, count })))
      }
      const { count } = await supabase.from('gift_messages').select('*', { count: 'exact', head: true }).eq('owner_id', p.id)
      setGiftCount(count || 0)
    }

    setInitializing(false)
  }

  function showError(msg: string) {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 4000)
  }

  async function saveProfile() {
    if (!owner) { showError('Profile not loaded — please refresh.'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('owner_profiles')
        .update({ name, headline, bio, personal_story: personalStory, contact_email_visible: contactEmailVisible, use_image_on_landing: useImageOnLanding, last_updated_at: new Date().toISOString() })
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
    setPhotoUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `profiles/${user.id}/main.${ext}`
      const { error: uploadError } = await supabase.storage.from('portfolio-media').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path)
      if (!data?.publicUrl) throw new Error('Could not get public URL')
      const urlWithBust = `${data.publicUrl}?t=${Date.now()}`
      const { error: updateError } = await supabase.from('owner_profiles').update({ profile_image_url: urlWithBust }).eq('id', owner.id)
      if (updateError) throw updateError
      setOwner({ ...owner, profile_image_url: urlWithBust })
    } catch (err: any) {
      showError(err?.message || 'Photo upload failed.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function addProject() {
    if (!owner) { showError('Profile not loaded — please refresh.'); return }
    if (!pTitle.trim()) return
    try {
      const { error } = await supabase.from('projects').insert({
        owner_id: owner.id,
        title: pTitle,
        description: pDesc,
        preview_text: pPreviewText,
        external_link: pLink,
        gallery_speed: pGallerySpeed,
        slug: slugify(pTitle) || `project-${Date.now()}`,
      })
      if (error) throw error
      setPTitle(''); setPDesc(''); setPLink(''); setPPreviewText(''); setPGallerySpeed(5)
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

  function startEditProject(p: any) {
    setEditingProjectId(p.id)
    setEpTitle(p.title)
    setEpDesc(p.description || '')
    setEpLink(p.external_link || '')
    setEpPreviewText(p.preview_text || '')
    setEpGallerySpeed(p.gallery_speed || 5)
    setShowNewProject(false)
  }

  function cancelEditProject() {
    setEditingProjectId(null)
    setEpTitle(''); setEpDesc(''); setEpLink(''); setEpPreviewText(''); setEpGallerySpeed(5)
  }

  async function updateProject() {
    if (!owner || !editingProjectId || !epTitle.trim()) return
    try {
      const { error } = await supabase.from('projects')
        .update({ title: epTitle, description: epDesc, external_link: epLink, preview_text: epPreviewText, gallery_speed: epGallerySpeed, updated_at: new Date().toISOString() })
        .eq('id', editingProjectId)
      if (error) throw error
      setProjects(projects.map(p =>
        p.id === editingProjectId ? { ...p, title: epTitle, description: epDesc, external_link: epLink, preview_text: epPreviewText, gallery_speed: epGallerySpeed } : p
      ))
      cancelEditProject()
    } catch (err: any) {
      showError(err?.message || 'Failed to update project.')
    }
  }

  async function addExperience() {
    if (!owner) { showError('Profile not loaded — please refresh.'); return }
    if (!eRole.trim() || !eCompany.trim()) return
    try {
      const { data: inserted, error } = await supabase.from('experiences').insert({
        owner_id: owner.id,
        role: eRole,
        company: eCompany,
        description: eDesc,
        preview_text: ePreviewText,
        gallery_speed: eGallerySpeed,
        slug: slugify(`${eRole}-${eCompany}`) || `exp-${Date.now()}`,
        start_date: eStart || null,
        end_date: eCurrent ? null : (eEnd || null),
        is_current: eCurrent,
      }).select('*').single()
      if (error) throw error
      setERole(''); setECompany(''); setEDesc(''); setEStart(''); setEEnd(''); setECurrent(false); setEPreviewText(''); setEGallerySpeed(5)
      setShowNewExp(false)
      await loadAll()
      // Auto-open edit so user can immediately add gallery images
      if (inserted) {
        setEeRole(inserted.role); setEeCompany(inserted.company); setEeDesc(inserted.description || '')
        setEeStart(inserted.start_date || ''); setEeEnd(inserted.end_date || ''); setEeCurrent(inserted.is_current || false)
        setEePreviewText(inserted.preview_text || ''); setEeGallerySpeed(inserted.gallery_speed || 5); setEeSlug(inserted.slug || '')
        setEditingExpId(inserted.id)
      }
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

  function startEditExperience(e: any) {
    setEditingExpId(e.id)
    setEeRole(e.role)
    setEeCompany(e.company)
    setEeDesc(e.description || '')
    setEeStart(e.start_date || '')
    setEeEnd(e.end_date || '')
    setEeCurrent(e.is_current || false)
    setEePreviewText(e.preview_text || '')
    setEeGallerySpeed(e.gallery_speed || 5)
    setEeSlug(e.slug || '')
    setShowNewExp(false)
  }

  function cancelEditExperience() {
    setEditingExpId(null)
    setEeRole(''); setEeCompany(''); setEeDesc(''); setEeStart(''); setEeEnd(''); setEeCurrent(false); setEePreviewText(''); setEeGallerySpeed(5); setEeSlug('')
  }

  async function updateExperience() {
    if (!owner || !editingExpId || !eeRole.trim() || !eeCompany.trim()) return
    try {
      const { error } = await supabase.from('experiences')
        .update({
          role: eeRole, company: eeCompany, description: eeDesc, preview_text: eePreviewText,
          gallery_speed: eeGallerySpeed, slug: eeSlug || slugify(`${eeRole}-${eeCompany}`) || undefined,
          start_date: eeStart || null, end_date: eeCurrent ? null : (eeEnd || null), is_current: eeCurrent,
        })
        .eq('id', editingExpId)
      if (error) throw error
      setExperiences(experiences.map(e =>
        e.id === editingExpId
          ? { ...e, role: eeRole, company: eeCompany, description: eeDesc, preview_text: eePreviewText, gallery_speed: eeGallerySpeed, slug: eeSlug, start_date: eeStart, end_date: eeCurrent ? null : eeEnd, is_current: eeCurrent }
          : e
      ))
      cancelEditExperience()
    } catch (err: any) {
      showError(err?.message || 'Failed to update experience.')
    }
  }

  async function addStory() {
    if (!owner) { showError('Profile not loaded — please refresh.'); return }
    if (!sTitle.trim()) return
    try {
      const { data: inserted, error } = await supabase.from('stories').insert({
        owner_id: owner.id,
        title: sTitle,
        content: sContent,
        preview_text: sPreviewText,
        series_id: sSeriesId || null,
        episode_number: sEpisodeNum ? parseInt(sEpisodeNum) : null,
        slug: slugify(sTitle) || `story-${Date.now()}`,
      }).select('*').single()
      if (error) throw error
      setSTitle(''); setSContent(''); setSSeriesId(''); setSEpisodeNum(''); setSPreviewText('')
      setShowNewStory(false)
      await loadAll()
      // Auto-open edit so user can immediately add story images
      if (inserted) {
        setEsTitle(inserted.title); setEsContent(inserted.content || '')
        setEsPreviewText(inserted.preview_text || ''); setEsSeriesId(inserted.series_id || '')
        setEsEpisodeNum(inserted.episode_number ? String(inserted.episode_number) : '')
        setEditingStoryId(inserted.id)
      }
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

  function startEditStory(s: any) {
    setEditingStoryId(s.id)
    setEsTitle(s.title)
    setEsContent(s.content || '')
    setEsSeriesId(s.series_id || '')
    setEsEpisodeNum(s.episode_number?.toString() || '')
    setEsPreviewText(s.preview_text || '')
    setShowNewStory(false)
  }

  function cancelEditStory() {
    setEditingStoryId(null)
    setEsTitle(''); setEsContent(''); setEsSeriesId(''); setEsEpisodeNum(''); setEsPreviewText('')
  }

  async function updateStory() {
    if (!owner || !editingStoryId || !esTitle.trim()) return
    try {
      const { error } = await supabase.from('stories')
        .update({
          title: esTitle, content: esContent, preview_text: esPreviewText,
          series_id: esSeriesId || null,
          episode_number: esEpisodeNum ? parseInt(esEpisodeNum) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingStoryId)
      if (error) throw error
      setStories(stories.map(s =>
        s.id === editingStoryId ? { ...s, title: esTitle, content: esContent, preview_text: esPreviewText, series_id: esSeriesId, episode_number: esEpisodeNum ? parseInt(esEpisodeNum) : null } : s
      ))
      cancelEditStory()
    } catch (err: any) {
      showError(err?.message || 'Failed to update story.')
    }
  }

  async function addSeries() {
    if (!owner || !ssTitle.trim()) return
    try {
      const { error } = await supabase.from('story_series').insert({
        owner_id: owner.id,
        title: ssTitle,
        description: ssDesc,
        preview_text: ssPreviewText,
        slug: slugify(ssTitle) || `series-${Date.now()}`,
      })
      if (error) throw error
      setSsTitle(''); setSsDesc(''); setSsPreviewText('')
      setShowNewSeries(false)
      loadAll()
    } catch (err: any) {
      showError(err?.message || 'Failed to add series.')
    }
  }

  async function deleteSeries(id: string) {
    try {
      const { error } = await supabase.from('story_series').delete().eq('id', id)
      if (error) throw error
      setStorySeries(storySeries.filter(s => s.id !== id))
    } catch (err: any) {
      showError(err?.message || 'Failed to delete series.')
    }
  }

  function startEditSeries(s: any) {
    setEditingSeriesId(s.id)
    setEssTitle(s.title)
    setEssDesc(s.description || '')
    setEssPreviewText(s.preview_text || '')
    setShowNewSeries(false)
  }

  function cancelEditSeries() {
    setEditingSeriesId(null)
    setEssTitle(''); setEssDesc(''); setEssPreviewText('')
  }

  async function updateSeries() {
    if (!owner || !editingSeriesId || !essTitle.trim()) return
    try {
      const { error } = await supabase.from('story_series')
        .update({ title: essTitle, description: essDesc, preview_text: essPreviewText, updated_at: new Date().toISOString() })
        .eq('id', editingSeriesId)
      if (error) throw error
      setStorySeries(storySeries.map(s =>
        s.id === editingSeriesId ? { ...s, title: essTitle, description: essDesc, preview_text: essPreviewText } : s
      ))
      cancelEditSeries()
    } catch (err: any) {
      showError(err?.message || 'Failed to update series.')
    }
  }

  async function addSocialLink() {
    if (!owner) { showError('Profile not loaded — please refresh.'); return }
    if (!slPlatform.trim() || !slUrl.trim()) return
    try {
      const { error } = await supabase.from('social_links').insert({ owner_id: owner.id, platform_name: slPlatform, url: slUrl })
      if (error) throw error
      setSlPlatform(''); setSlUrl('')
      setShowNewSocial(false)
      loadAll()
    } catch (err: any) {
      showError(err?.message || 'Failed to add social link.')
    }
  }

  async function deleteSocialLink(id: string) {
    try {
      const { error } = await supabase.from('social_links').delete().eq('id', id)
      if (error) throw error
      setSocialLinks(socialLinks.filter(l => l.id !== id))
    } catch (err: any) {
      showError(err?.message || 'Failed to delete social link.')
    }
  }

  async function uploadMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !owner) return
    setMediaUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      const ext = file.name.split('.').pop()
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      const path = `media/${owner.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('portfolio-media').upload(path, file, { upsert: false })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('portfolio-media').getPublicUrl(path)
      if (!urlData?.publicUrl) throw new Error('Could not get public URL')
      const { data: inserted, error: dbError } = await supabase.from('media')
        .insert({ owner_id: owner.id, url: urlData.publicUrl, media_type: mediaType, alt_text: mediaAltText.trim() })
        .select().single()
      if (dbError) throw dbError
      setMedia([inserted, ...media])
      setMediaAltText('')
      e.target.value = ''
    } catch (err: any) {
      showError(err?.message || 'Media upload failed.')
    } finally {
      setMediaUploading(false)
    }
  }

  async function deleteMedia(id: string, url: string) {
    try {
      const path = url.split('/storage/v1/object/public/portfolio-media/')[1]
      if (path) await supabase.storage.from('portfolio-media').remove([path])
      const { error } = await supabase.from('media').delete().eq('id', id)
      if (error) throw error
      setMedia(media.filter(m => m.id !== id))
    } catch (err: any) {
      showError(err?.message || 'Failed to delete media.')
    }
  }

  async function deleteEntityMedia(id: string, url: string) {
    try {
      const path = url?.split('/storage/v1/object/public/portfolio-media/')[1]
      if (path) await supabase.storage.from('portfolio-media').remove([path])
      await supabase.from('media').delete().eq('id', id)
      loadAll()
    } catch (err: any) {
      showError(err?.message || 'Failed to delete image.')
    }
  }

  function startReplaceMedia(id: string, oldUrl: string) {
    setReplacingMediaId(id)
    setReplacingMediaOldUrl(oldUrl)
    setReplaceFile(null)
    setReplaceUrl('')
  }

  function cancelReplaceMedia() {
    setReplacingMediaId(null)
    setReplacingMediaOldUrl('')
    setReplaceFile(null)
    setReplaceUrl('')
  }

  async function commitReplaceMedia() {
    if (!replacingMediaId) return
    setReplacing(true)
    try {
      let newUrl = ''
      let sourceType = 'upload'
      if (replaceFile) {
        const ext = replaceFile.name.split('.').pop()
        const path = `replace/${replacingMediaId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('portfolio-media').upload(path, replaceFile)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('portfolio-media').getPublicUrl(path)
        newUrl = publicUrl
        // Delete old file from storage if it was an upload
        const oldPath = replacingMediaOldUrl?.split('/storage/v1/object/public/portfolio-media/')[1]
        if (oldPath) await supabase.storage.from('portfolio-media').remove([oldPath])
      } else if (replaceUrl.trim()) {
        // Google Drive conversion
        const driveMatch = replaceUrl.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
        newUrl = driveMatch
          ? `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`
          : replaceUrl.trim()
        sourceType = 'external_link'
      }
      if (!newUrl) { showError('Select a file or paste a URL to replace with.'); return }
      const { error } = await supabase.from('media').update({
        url: newUrl,
        source_type: sourceType,
        external_url: sourceType === 'external_link' ? newUrl : '',
      }).eq('id', replacingMediaId)
      if (error) throw error
      cancelReplaceMedia()
      loadAll()
    } catch (err: any) {
      showError(err?.message || 'Failed to replace media.')
    } finally {
      setReplacing(false)
    }
  }

  async function signOut() {
    try { await supabase.auth.signOut() } catch (_) {}
    window.location.href = '/'
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'stories', label: 'Stories' },
    { id: 'social', label: 'Social Links' },
    { id: 'media', label: 'Media' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'messages', label: `Messages${messages.filter(m => !m.is_read).length > 0 ? ` (${messages.filter(m => !m.is_read).length})` : ''}` },
  ]

  const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30'
  const textareaCls = `${inputCls} resize-none`

  return (
    <div className="min-h-screen bg-slate-950">
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-sm max-w-sm text-center">
          {errorMsg}
        </div>
      )}

      {initializing && (
        <div className="bg-white/[0.03] border-b border-white/[0.06] px-6 py-2.5 flex items-center justify-center gap-2 text-xs text-white/30">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Setting up your dashboard…
        </div>
      )}

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

      <div className="flex flex-col md:flex-row">
        <nav className="w-44 border-r border-white/[0.06] min-h-[calc(100vh-57px)] p-4 space-y-1 hidden md:block">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="md:hidden flex gap-1 px-4 pt-4 pb-0 overflow-x-auto w-full">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/40'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 md:p-10 w-full max-w-full md:max-w-3xl">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {/* ── PROFILE TAB ─────────────────────────────────── */}
            {tab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 flex-shrink-0">
                    {owner?.profile_image_url ? (
                      <Image src={owner.profile_image_url} alt="Profile" width={64} height={64} className="object-cover object-top w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">?</div>
                    )}
                  </div>
                  <label className={`cursor-pointer ${photoUploading ? 'pointer-events-none' : ''}`}>
                    <span className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
                      {photoUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Replace photo</>}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={photoUploading} />
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Headline</label>
                    <input value={headline} onChange={e => setHeadline(e.target.value)} className={inputCls} />
                    <AISuggestButton text={headline} context="professional headline for a portfolio website" onAccept={setHeadline} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} className={textareaCls} />
                    <AISuggestButton text={bio} context="personal bio for a portfolio website" onAccept={setBio} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Personal Story <span className="text-white/20 font-normal">(shown on About page)</span></label>
                    <textarea value={personalStory} onChange={e => setPersonalStory(e.target.value)} rows={6} placeholder="Share a deeper story…" className={textareaCls} />
                    <AISuggestButton text={personalStory} context="personal story section for a portfolio website" onAccept={setPersonalStory} />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm text-white/70">Show contact form on /connect</p>
                      <p className="text-xs text-white/30 mt-0.5">Visitors can send you messages</p>
                    </div>
                    <button type="button" onClick={() => setContactEmailVisible(!contactEmailVisible)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${contactEmailVisible ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${contactEmailVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm text-white/70">Show photo on landing page</p>
                      <p className="text-xs text-white/30 mt-0.5">Display profile image on home screen</p>
                    </div>
                    <button type="button" onClick={() => setUseImageOnLanding(!useImageOnLanding)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${useImageOnLanding ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${useImageOnLanding ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <button onClick={saveProfile} disabled={saving || initializing}
                  className="px-5 py-2.5 bg-white text-slate-950 text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saved ? <><Check className="w-4 h-4 text-emerald-600" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
                </button>

                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Shareable links</p>
                  {['/projects', '/experience', '/about', '/stories', '/connect'].map(p => (
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
                    <input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Title *" className={inputCls} />
                    <AIEnhanceButton originalText={pTitle} context="project title for a portfolio website" suggestionType="title" onAccept={setPTitle} />
                    <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Full description" rows={4} className={textareaCls} />
                    <AISuggestButton text={pDesc} context="project description for a portfolio website" onAccept={setPDesc} />
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Preview text <span className="text-white/20">(shown on the card — 1-2 sentence hook)</span></label>
                      <textarea value={pPreviewText} onChange={e => setPPreviewText(e.target.value)} placeholder="A short, compelling teaser that makes visitors want to click…" rows={2} className={textareaCls} />
                      <AIEnhanceButton originalText={pDesc || pPreviewText} context="project preview hook for portfolio card" suggestionType="preview_text" onAccept={setPPreviewText} />
                    </div>
                    <GallerySpeedSlider value={pGallerySpeed} onChange={setPGallerySpeed} />
                    <input value={pLink} onChange={e => setPLink(e.target.value)} placeholder="External link (optional)" className={inputCls} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={addProject} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                      <button onClick={() => setShowNewProject(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                    </div>
                  </div>
                )}

                {projects.map((p) => (
                  <div key={p.id}>
                    {editingProjectId === p.id ? (
                      <div className="bg-white/[0.03] border border-violet-500/30 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-medium text-white mb-3">Edit project</h3>
                        <input value={epTitle} onChange={e => setEpTitle(e.target.value)} placeholder="Title *" className={inputCls} />
                        <AIEnhanceButton originalText={epTitle} context="project title for a portfolio website" suggestionType="title" onAccept={setEpTitle} />
                        <textarea value={epDesc} onChange={e => setEpDesc(e.target.value)} placeholder="Full description" rows={4} className={textareaCls} />
                        <AISuggestButton text={epDesc} context="project description for a portfolio website" onAccept={setEpDesc} />
                        <div>
                          <label className="text-xs text-white/40 mb-1 block">Preview text</label>
                          <textarea value={epPreviewText} onChange={e => setEpPreviewText(e.target.value)} placeholder="Short compelling hook…" rows={2} className={textareaCls} />
                          <AIEnhanceButton originalText={epDesc || epPreviewText} context="project preview for portfolio card" suggestionType="preview_text" onAccept={setEpPreviewText} />
                        </div>
                        <GallerySpeedSlider value={epGallerySpeed} onChange={setEpGallerySpeed} />
                        <input value={epLink} onChange={e => setEpLink(e.target.value)} placeholder="External link (optional)" className={inputCls} />
                        <div>
                          <label className="text-xs text-white/40 mb-2 block">Gallery images</label>
                          <MediaMiniGrid media={projMediaMap[p.id] || []} onDelete={deleteEntityMedia} onReplace={startReplaceMedia} />
                          <div className="mt-3">
                            <MediaInputPanel entityType="project" entityId={p.id} ownerId={owner?.id || ''} onUploaded={loadAll} />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={updateProject} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                          <button onClick={cancelEditProject} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm">{p.title}</p>
                          {p.preview_text && <p className="text-white/40 text-xs mt-0.5 line-clamp-1 italic">"{p.preview_text}"</p>}
                          {p.description && <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{p.description}</p>}
                          <div className="flex items-center gap-3 mt-1">
                            {(projMediaMap[p.id]?.length || 0) > 0 && (
                              <span className="text-[10px] text-white/20">{projMediaMap[p.id].length} image{projMediaMap[p.id].length !== 1 ? 's' : ''}</span>
                            )}
                            <CopyLink path={`/projects/${p.slug}`} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <button onClick={() => startEditProject(p)} className="text-white/20 hover:text-violet-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteProject(p.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
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
                    <textarea value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Full description — bullet points work great (use • or dashes)" rows={4} className={textareaCls} />
                    <AISuggestButton text={eDesc} context="professional role description for a portfolio/resume" onAccept={setEDesc} />
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Preview text <span className="text-white/20">(hook for the card — 1-2 sentences)</span></label>
                      <textarea value={ePreviewText} onChange={e => setEPreviewText(e.target.value)} placeholder="A compelling teaser that makes visitors want to read more…" rows={2} className={textareaCls} />
                      <AIEnhanceButton originalText={eDesc || ePreviewText} context="experience preview text for portfolio card" suggestionType="preview_text" onAccept={setEPreviewText} />
                    </div>
                    <GallerySpeedSlider value={eGallerySpeed} onChange={setEGallerySpeed} />
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
                  <div key={e.id}>
                    {editingExpId === e.id ? (
                      <div className="bg-white/[0.03] border border-violet-500/30 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-medium text-white mb-3">Edit experience</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <input value={eeRole} onChange={ev => setEeRole(ev.target.value)} placeholder="Role *"
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                          <input value={eeCompany} onChange={ev => setEeCompany(ev.target.value)} placeholder="Company *"
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                        </div>
                        <textarea value={eeDesc} onChange={ev => setEeDesc(ev.target.value)} placeholder="Full description" rows={5} className={textareaCls} />
                        <AISuggestButton text={eeDesc} context="professional role description for a portfolio/resume" onAccept={setEeDesc} />
                        <div>
                          <label className="text-xs text-white/40 mb-1 block">Preview text</label>
                          <textarea value={eePreviewText} onChange={ev => setEePreviewText(ev.target.value)} placeholder="Short compelling hook…" rows={2} className={textareaCls} />
                          <AIEnhanceButton originalText={eeDesc || eePreviewText} context="experience preview for portfolio card" suggestionType="preview_text" onAccept={setEePreviewText} />
                        </div>
                        <GallerySpeedSlider value={eeGallerySpeed} onChange={setEeGallerySpeed} />
                        <div>
                          <label className="text-xs text-white/40 mb-1 block">URL slug <span className="text-white/20">(used for /experience/[slug])</span></label>
                          <input value={eeSlug} onChange={ev => setEeSlug(ev.target.value)} placeholder="auto-generated from role + company" className={inputCls} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="date" value={eeStart} onChange={ev => setEeStart(ev.target.value)}
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-white/30" />
                          {!eeCurrent && (
                            <input type="date" value={eeEnd} onChange={ev => setEeEnd(ev.target.value)}
                              className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-white/30" />
                          )}
                        </div>
                        <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer">
                          <input type="checkbox" checked={eeCurrent} onChange={ev => setEeCurrent(ev.target.checked)} className="accent-violet-500" />
                          Current role
                        </label>
                        <div>
                          <label className="text-xs text-white/40 mb-2 block">Gallery images</label>
                          <MediaMiniGrid media={expMediaMap[e.id] || []} onDelete={deleteEntityMedia} onReplace={startReplaceMedia} />
                          <div className="mt-3">
                            <MediaInputPanel entityType="experience" entityId={e.id} ownerId={owner?.id || ''} onUploaded={loadAll} />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={updateExperience} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                          <button onClick={cancelEditExperience} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                        <div>
                          <p className="font-medium text-white text-sm">{e.role}</p>
                          <p className="text-violet-400 text-xs">{e.company}</p>
                          {e.preview_text && <p className="text-white/40 text-xs mt-1 line-clamp-1 italic">"{e.preview_text}"</p>}
                          {!e.preview_text && e.description && <p className="text-white/30 text-xs mt-1 line-clamp-1">{e.description}</p>}
                          <div className="flex items-center gap-3 mt-1">
                            {(expMediaMap[e.id]?.length || 0) > 0 && (
                              <span className="text-[10px] text-white/20">{expMediaMap[e.id].length} image{expMediaMap[e.id].length !== 1 ? 's' : ''}</span>
                            )}
                            {e.slug && <CopyLink path={`/experience/${e.slug}`} />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <button onClick={() => startEditExperience(e)} className="text-white/20 hover:text-violet-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteExperience(e.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {experiences.length === 0 && !showNewExp && (
                  <p className="text-white/20 text-sm text-center py-10">No experience yet.</p>
                )}
              </div>
            )}

            {/* ── STORIES TAB ─────────────────────────────────── */}
            {tab === 'stories' && (
              <div className="space-y-6">
                {/* ── Series section ── */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Series & Episodes</h2>
                      <p className="text-xs text-white/30 mt-0.5">Group stories into episodes (e.g. 90-day challenges)</p>
                    </div>
                    <button onClick={() => setShowNewSeries(true)} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" /> New series
                    </button>
                  </div>

                  {showNewSeries && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                      <h3 className="text-sm font-medium text-white mb-3">New series</h3>
                      <input value={ssTitle} onChange={e => setSsTitle(e.target.value)} placeholder="Series title *" className={inputCls} />
                      <AIEnhanceButton originalText={ssTitle} context="story series title for a portfolio" suggestionType="title" onAccept={setSsTitle} />
                      <textarea value={ssDesc} onChange={e => setSsDesc(e.target.value)} placeholder="What is this series about?" rows={3} className={textareaCls} />
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">Preview text</label>
                        <textarea value={ssPreviewText} onChange={e => setSsPreviewText(e.target.value)} placeholder="Short hook for the series card…" rows={2} className={textareaCls} />
                        <AIEnhanceButton originalText={ssDesc || ssPreviewText} context="story series preview for portfolio" suggestionType="preview_text" onAccept={setSsPreviewText} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={addSeries} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save series</button>
                        <button onClick={() => setShowNewSeries(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                      </div>
                    </div>
                  )}

                  {storySeries.map((s) => (
                    <div key={s.id}>
                      {editingSeriesId === s.id ? (
                        <div className="bg-white/[0.03] border border-amber-500/30 rounded-2xl p-5 space-y-3">
                          <h3 className="text-sm font-medium text-white mb-3">Edit series</h3>
                          <input value={essTitle} onChange={e => setEssTitle(e.target.value)} placeholder="Series title *" className={inputCls} />
                          <AIEnhanceButton originalText={essTitle} context="story series title" suggestionType="title" onAccept={setEssTitle} />
                          <textarea value={essDesc} onChange={e => setEssDesc(e.target.value)} placeholder="Description" rows={3} className={textareaCls} />
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">Preview text</label>
                            <textarea value={essPreviewText} onChange={e => setEssPreviewText(e.target.value)} rows={2} className={textareaCls} />
                            <AIEnhanceButton originalText={essDesc || essPreviewText} context="story series preview" suggestionType="preview_text" onAccept={setEssPreviewText} />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={updateSeries} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                            <button onClick={cancelEditSeries} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between bg-white/[0.03] border border-amber-500/10 rounded-xl p-4">
                          <div>
                            <p className="font-medium text-white text-sm">{s.title}</p>
                            {s.preview_text && <p className="text-white/40 text-xs mt-0.5 line-clamp-1 italic">"{s.preview_text}"</p>}
                            <div className="mt-1">
                              <CopyLink path={`/stories/${s.slug}`} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button onClick={() => startEditSeries(s)} className="text-white/20 hover:text-amber-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => deleteSeries(s.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {storySeries.length === 0 && !showNewSeries && (
                    <p className="text-white/20 text-xs text-center py-4">No series yet. Create one to group episodic content.</p>
                  )}
                </div>

                <div className="border-t border-white/[0.06] pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">Stories & Articles</h3>
                      <p className="text-xs text-white/30 mt-0.5">Standalone articles or episodes in a series</p>
                    </div>
                    <button onClick={() => setShowNewStory(true)} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {showNewStory && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                      <h3 className="text-sm font-medium text-white mb-3">New story / episode</h3>
                      <input value={sTitle} onChange={e => setSTitle(e.target.value)} placeholder="Title *" className={inputCls} />
                      <AIEnhanceButton originalText={sTitle} context="story or episode title for a portfolio" suggestionType="title" onAccept={setSTitle} />
                      <textarea value={sContent} onChange={e => setSContent(e.target.value)} placeholder="Tell your story…" rows={6} className={textareaCls} />
                      <AISuggestButton text={sContent} context="personal story or social life post for a portfolio website" onAccept={setSContent} />
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">Preview text</label>
                        <textarea value={sPreviewText} onChange={e => setSPreviewText(e.target.value)} placeholder="Short hook for the card…" rows={2} className={textareaCls} />
                        <AIEnhanceButton originalText={sContent || sPreviewText} context="story preview hook" suggestionType="preview_text" onAccept={setSPreviewText} />
                      </div>
                      {storySeries.length > 0 && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">Assign to series <span className="text-white/20">(optional)</span></label>
                            <select value={sSeriesId} onChange={e => setSSeriesId(e.target.value)}
                              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30">
                              <option value="">— Standalone article —</option>
                              {storySeries.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                          </div>
                          {sSeriesId && (
                            <input type="number" value={sEpisodeNum} onChange={e => setSEpisodeNum(e.target.value)} placeholder="Episode number (e.g. 1)"
                              min={1} className={inputCls} />
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button onClick={addStory} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                        <button onClick={() => setShowNewStory(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                      </div>
                    </div>
                  )}

                  {stories.map((s) => (
                    <div key={s.id}>
                      {editingStoryId === s.id ? (
                        <div className="bg-white/[0.03] border border-violet-500/30 rounded-2xl p-5 space-y-3">
                          <h3 className="text-sm font-medium text-white mb-3">Edit story</h3>
                          <input value={esTitle} onChange={e => setEsTitle(e.target.value)} placeholder="Title *" className={inputCls} />
                          <AIEnhanceButton originalText={esTitle} context="story title for a portfolio" suggestionType="title" onAccept={setEsTitle} />
                          <textarea value={esContent} onChange={e => setEsContent(e.target.value)} placeholder="Tell your story…" rows={6} className={textareaCls} />
                          <AISuggestButton text={esContent} context="personal story or social life post for a portfolio website" onAccept={setEsContent} />
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">Preview text</label>
                            <textarea value={esPreviewText} onChange={e => setEsPreviewText(e.target.value)} placeholder="Short hook…" rows={2} className={textareaCls} />
                            <AIEnhanceButton originalText={esContent || esPreviewText} context="story preview hook" suggestionType="preview_text" onAccept={setEsPreviewText} />
                          </div>
                          {storySeries.length > 0 && (
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs text-white/40 mb-1 block">Series</label>
                                <select value={esSeriesId} onChange={e => setEsSeriesId(e.target.value)}
                                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30">
                                  <option value="">— Standalone article —</option>
                                  {storySeries.map(ser => <option key={ser.id} value={ser.id}>{ser.title}</option>)}
                                </select>
                              </div>
                              {esSeriesId && (
                                <input type="number" value={esEpisodeNum} onChange={e => setEsEpisodeNum(e.target.value)} placeholder="Episode number" min={1} className={inputCls} />
                              )}
                            </div>
                          )}
                          <div>
                            <label className="text-xs text-white/40 mb-2 block">Story images</label>
                            <MediaMiniGrid media={storyMediaMap[s.id] || []} onDelete={deleteEntityMedia} onReplace={startReplaceMedia} />
                            <div className="mt-3">
                              <MediaInputPanel entityType="story" entityId={s.id} ownerId={owner?.id || ''} onUploaded={loadAll} />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={updateStory} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                            <button onClick={cancelEditStory} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white text-sm">{s.title}</p>
                              {s.series_id && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                                  {storySeries.find(ser => ser.id === s.series_id)?.title || 'Series'}
                                  {s.episode_number ? ` #${s.episode_number}` : ''}
                                </span>
                              )}
                            </div>
                            {s.preview_text && <p className="text-white/40 text-xs mt-0.5 line-clamp-1 italic">"{s.preview_text}"</p>}
                            {!s.preview_text && s.content && <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{s.content}</p>}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button onClick={() => startEditStory(s)} className="text-white/20 hover:text-violet-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => deleteStory(s.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {stories.length === 0 && !showNewStory && (
                    <p className="text-white/20 text-sm text-center py-10">No stories yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── SOCIAL LINKS TAB ────────────────────────────── */}
            {tab === 'social' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Social Links</h2>
                    <p className="text-xs text-white/30 mt-0.5">Shown on /connect and /about pages</p>
                  </div>
                  <button onClick={() => setShowNewSocial(true)} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {showNewSocial && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-medium text-white mb-3">New social link</h3>
                    <input value={slPlatform} onChange={e => setSlPlatform(e.target.value)} placeholder="Platform (e.g. LinkedIn, GitHub)" className={inputCls} />
                    <input value={slUrl} onChange={e => setSlUrl(e.target.value)} placeholder="URL (https://…)" className={inputCls} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={addSocialLink} className="px-4 py-2 bg-white text-slate-950 text-sm font-semibold rounded-lg hover:bg-white/90">Save</button>
                      <button onClick={() => setShowNewSocial(false)} className="px-4 py-2 text-white/40 text-sm hover:text-white/70">Cancel</button>
                    </div>
                  </div>
                )}

                {socialLinks.map((l) => (
                  <div key={l.id} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                    <div>
                      <p className="font-medium text-white text-sm">{l.platform_name}</p>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-rose-400 text-xs flex items-center gap-1 mt-0.5 hover:text-rose-300">
                        <ExternalLink className="w-3 h-3" /> {l.url}
                      </a>
                    </div>
                    <button onClick={() => deleteSocialLink(l.id)} className="text-white/20 hover:text-red-400 transition-colors ml-3">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {socialLinks.length === 0 && !showNewSocial && (
                  <p className="text-white/20 text-sm text-center py-10">No social links yet. Add your first one!</p>
                )}
              </div>
            )}

            {/* ── MEDIA TAB ───────────────────────────────────── */}
            {tab === 'media' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Media <span className="text-white/30 text-sm font-normal ml-1">({media.length})</span></h2>
                    <p className="text-xs text-white/30 mt-0.5">General media library — use the Experience/Project/Story tabs to assign images to specific content</p>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-medium text-white">Upload new file</h3>
                  <input value={mediaAltText} onChange={e => setMediaAltText(e.target.value)} placeholder="Alt text / caption (optional)"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                  <label className={`flex items-center gap-2 cursor-pointer ${mediaUploading ? 'pointer-events-none opacity-50' : ''}`}>
                    <span className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
                      {mediaUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Choose file</>}
                    </span>
                    <span className="text-xs text-white/30">Images or videos</span>
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={uploadMedia} disabled={mediaUploading} />
                  </label>
                </div>

                {media.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {media.map((m) => (
                      <div key={m.id} className="relative group bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden aspect-square">
                        {m.media_type === 'video' ? (
                          <video src={m.url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                          <Image src={m.url} alt={m.alt_text || 'Media'} fill className="object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          {m.alt_text && <p className="text-white/70 text-xs text-center line-clamp-2">{m.alt_text}</p>}
                          <button onClick={() => deleteMedia(m.id, m.url)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/20 text-sm text-center py-10">No media uploaded yet.</p>
                )}
              </div>
            )}

            {/* ── ANALYTICS TAB ───────────────────────────────── */}
            {tab === 'analytics' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white">Analytics</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-center">
                    <MessageSquare className="w-5 h-5 text-white/30 mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-white">{messages.length}</p>
                    <p className="text-xs text-white/30 mt-0.5">Messages</p>
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
                              <span>{page_name}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.6 }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MESSAGES TAB ────────────────────────────────── */}
            {tab === 'messages' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white">
                  Messages <span className="text-white/30 text-sm font-normal ml-1">({messages.length})</span>
                </h2>

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                      <span className="text-xl">💬</span>
                    </div>
                    <p className="text-white/30 text-sm">No messages yet.</p>
                    <p className="text-white/20 text-xs mt-1">Messages sent from /connect will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`bg-white/[0.03] border rounded-2xl p-5 space-y-2 ${msg.is_read ? 'border-white/[0.07]' : 'border-rose-500/30'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{msg.sender_name}</p>
                            <p className="text-xs text-white/40">{msg.sender_email}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {!msg.is_read && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-medium">New</span>}
                            <p className="text-xs text-white/30">
                              {new Date(msg.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{msg.message}</p>
                        {!msg.is_read && (
                          <button
                            onClick={async () => {
                              await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: msg.id }) })
                              setMessages(messages.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
                            }}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </main>
      </div>

      {/* ── Replace Media Modal ─────────────────────────── */}
      {replacingMediaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Replace image</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Upload new file</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => { setReplaceFile(e.target.files?.[0] || null); setReplaceUrl('') }}
                  className="block w-full text-xs text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/20">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Paste a new URL</label>
                <input
                  type="url"
                  value={replaceUrl}
                  onChange={e => { setReplaceUrl(e.target.value); setReplaceFile(null) }}
                  placeholder="https://drive.google.com/… or image URL"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={commitReplaceMedia}
                disabled={replacing || (!replaceFile && !replaceUrl.trim())}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-lg disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {replacing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Replace
              </button>
              <button
                onClick={cancelReplaceMedia}
                className="px-4 py-2 text-white/40 text-sm hover:text-white/70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
