'use client'

import { useState, useRef } from 'react'
import { Upload, Link2, Check, X, Loader2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MediaInputPanelProps {
  entityType: string
  entityId: string
  ownerId: string
  onUploaded: () => void
}

function convertToDirectUrl(url: string): string {
  // Google Drive: https://drive.google.com/file/d/FILE_ID/view?...
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  }
  return url
}

function detectMediaType(url: string): 'image' | 'video' | 'youtube' | 'vimeo' {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return 'youtube'
  if (/vimeo\.com\//.test(url)) return 'vimeo'
  if (/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(url)) return 'video'
  return 'image'
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match) return `https://player.vimeo.com/video/${match[1]}`
  return url
}

export default function MediaInputPanel({ entityType, entityId, ownerId, onUploaded }: MediaInputPanelProps) {
  const [tab, setTab] = useState<'upload' | 'link'>('upload')
  const [altText, setAltText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Link tab state
  const [linkUrl, setLinkUrl] = useState('')
  const [resolvedUrl, setResolvedUrl] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [previewOk, setPreviewOk] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'youtube' | 'vimeo'>('image')

  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function reset() {
    setError('')
    setAltText('')
    setLinkUrl('')
    setResolvedUrl('')
    setPreviewOk(false)
    setPreviewError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function insertMediaRecord(fields: {
    url: string
    media_type: string
    source_type: string
    external_url?: string
  }) {
    const { error } = await supabase.from('media').insert({
      owner_id: ownerId,
      url: fields.url,
      media_type: fields.media_type,
      alt_text: altText,
      associated_entity_type: entityType,
      associated_entity_id: entityId,
      source_type: fields.source_type,
      external_url: fields.external_url || '',
      is_approved: true,
      sort_order: 0,
    })
    if (error) throw new Error(error.message)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${entityType}/${entityId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('portfolio-media').upload(path, file)
      if (upErr) throw new Error(upErr.message)
      const { data: { publicUrl } } = supabase.storage.from('portfolio-media').getPublicUrl(path)
      const isVid = file.type.startsWith('video/')
      await insertMediaRecord({ url: publicUrl, media_type: isVid ? 'video' : 'image', source_type: 'upload' })
      reset()
      onUploaded()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handlePreview() {
    setPreviewError('')
    setPreviewOk(false)

    const converted = convertToDirectUrl(linkUrl.trim())
    setResolvedUrl(converted)
    const type = detectMediaType(converted)
    setMediaType(type)

    // YouTube and Vimeo — always show embed, no pre-check needed
    if (type === 'youtube' || type === 'vimeo') {
      setPreviewOk(true)
      return
    }

    // Video files — show directly, no pre-check
    if (type === 'video') {
      setPreviewOk(true)
      return
    }

    // Images — attempt to load visually (the img tag itself serves as the preview)
    setPreviewing(true)
  }

  async function handleAcceptLink(force = false) {
    if (!linkUrl || (!previewOk && !force)) return
    setUploading(true)
    setError('')
    try {
      const url = resolvedUrl || convertToDirectUrl(linkUrl.trim())
      const type = detectMediaType(url)
      const isVid = type !== 'image'
      await insertMediaRecord({
        url,
        media_type: isVid ? 'video' : 'image',
        source_type: 'external_link',
        external_url: url,
      })
      reset()
      onUploaded()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save link')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 w-fit">
        {(['upload', 'link'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); reset() }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            {t === 'upload' ? <><Upload className="w-3 h-3 inline mr-1" />Upload</> : <><Link2 className="w-3 h-3 inline mr-1" />Paste Link</>}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-xs text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 disabled:opacity-50"
          />
          <input
            type="text"
            value={altText}
            onChange={e => setAltText(e.target.value)}
            placeholder="Alt text (optional)"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30"
          />
          {uploading && <p className="text-xs text-white/40 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</p>}
        </div>
      )}

      {tab === 'link' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={e => { setLinkUrl(e.target.value); setPreviewOk(false); setPreviewError(''); setPreviewing(false) }}
              placeholder="https://drive.google.com/… or any image/video URL"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={handlePreview}
              disabled={!linkUrl || previewing}
              className="px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-40"
            >
              {previewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Preview'}
            </button>
          </div>

          {/* Google Drive hint */}
          {linkUrl.includes('drive.google.com') && (
            <p className="text-[10px] text-amber-400/70">Google Drive link detected — will auto-convert to direct URL</p>
          )}

          {/* Image preview — rendered in DOM so it acts as the preview itself */}
          {previewing && !previewOk && !previewError && (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedUrl}
                alt="preview"
                className="w-full max-h-40 object-contain rounded-lg border border-white/10"
                onLoad={() => { setPreviewOk(true); setPreviewing(false) }}
                onError={() => { setPreviewError("Couldn't auto-preview this URL."); setPreviewing(false) }}
              />
            </div>
          )}

          {/* Successful image preview */}
          {previewOk && mediaType === 'image' && (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolvedUrl} alt="preview" className="w-full max-h-40 object-contain rounded-lg border border-white/10" />
            </div>
          )}

          {/* Video preview */}
          {previewOk && mediaType === 'video' && (
            <video src={resolvedUrl} controls className="w-full max-h-40 rounded-lg border border-white/10" />
          )}

          {/* YouTube embed preview */}
          {previewOk && mediaType === 'youtube' && (
            <iframe
              src={getYouTubeEmbedUrl(resolvedUrl)}
              className="w-full aspect-video rounded-lg border border-white/10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {/* Vimeo embed preview */}
          {previewOk && mediaType === 'vimeo' && (
            <iframe
              src={getVimeoEmbedUrl(resolvedUrl)}
              className="w-full aspect-video rounded-lg border border-white/10"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}

          {/* Preview error — still allow saving */}
          {previewError && (
            <div className="space-y-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400">{previewError} You can still save the link if you know it's valid.</p>
              <button
                type="button"
                onClick={() => handleAcceptLink(true)}
                disabled={uploading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" /> Save anyway
              </button>
            </div>
          )}

          {/* Accept/cancel buttons shown when preview is OK */}
          {previewOk && (
            <div className="space-y-2">
              <input
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                placeholder="Alt text (optional)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAcceptLink()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
                >
                  <Check className="w-3 h-3" /> Accept
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
