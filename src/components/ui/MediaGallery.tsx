'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'
import Image from 'next/image'

interface MediaItem {
  url: string
  alt_text?: string
  media_type?: string
  source_type?: string
  external_url?: string
}

interface MediaGalleryProps {
  media: MediaItem[]
  speedSeconds?: number
}

function isSupabaseUrl(url: string) {
  return url.includes('.supabase.co')
}

function isVideo(item: MediaItem) {
  return item.media_type === 'video'
}

function getEmbedUrl(url: string): string | null {
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) return url
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

export default function MediaGallery({ media, speedSeconds = 5 }: MediaGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  const items = media.filter(m => m.url || m.external_url)
  const total = items.length

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  const currentUrl = items[current]
    ? (items[current].source_type === 'external_link' && items[current].external_url
        ? items[current].external_url
        : items[current].url) ?? ''
    : ''
  const isCurrentEmbed = Boolean(getEmbedUrl(currentUrl))

  useEffect(() => {
    if (total <= 1 || paused || isCurrentEmbed) return
    const id = setInterval(next, speedSeconds * 1000)
    return () => clearInterval(id)
  }, [total, paused, speedSeconds, next, isCurrentEmbed])

  if (total === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
        <p className="text-white/20 text-sm">No images yet</p>
      </div>
    )
  }

  const item = items[current]
  const mediaUrl = item.source_type === 'external_link' && item.external_url ? item.external_url : item.url

  return (
    <>
      <div
        className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-slate-900 group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {(() => {
              const embedUrl = getEmbedUrl(mediaUrl)
              if (embedUrl) {
                return (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              }
              if (isVideo(item)) {
                return (
                  <video
                    src={mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                )
              }
              if (isSupabaseUrl(mediaUrl)) {
                return (
                  <Image
                    src={mediaUrl}
                    alt={item.alt_text || ''}
                    fill
                    priority
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )
              }
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl}
                  alt={item.alt_text || ''}
                  loading="eager"
                  className="w-full h-full object-contain"
                />
              )
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Expand button */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
        >
          <Expand className="w-4 h-4" />
        </button>

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            onKeyDown={e => e.key === 'Escape' && setLightbox(false)}
            tabIndex={-1}
          >
            {/* Close hint */}
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none select-none">
              Click anywhere or press Esc to close
            </p>
            <button
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
              onClick={e => { e.stopPropagation(); setLightbox(false) }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              className="relative max-w-5xl w-full h-[80vh] cursor-default"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const embedUrl = getEmbedUrl(mediaUrl)
                if (embedUrl) {
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full rounded-xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
                if (isVideo(item)) {
                  return <video src={mediaUrl} controls autoPlay className="w-full h-full object-contain rounded-xl" />
                }
                if (isSupabaseUrl(mediaUrl)) {
                  return <Image src={mediaUrl} alt={item.alt_text || ''} fill className="object-contain rounded-xl" />
                }
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl} alt={item.alt_text || ''} className="w-full h-full object-contain rounded-xl" />
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
