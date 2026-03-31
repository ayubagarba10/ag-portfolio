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

export default function MediaGallery({ media, speedSeconds = 5 }: MediaGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  const items = media.filter(m => m.url || m.external_url)
  const total = items.length

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (total <= 1 || paused) return
    const id = setInterval(next, speedSeconds * 1000)
    return () => clearInterval(id)
  }, [total, paused, speedSeconds, next])

  if (total === 0) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
        <p className="text-white/20 text-sm">No images yet</p>
      </div>
    )
  }

  const item = items[current]
  const mediaUrl = item.source_type === 'external_link' && item.external_url ? item.external_url : item.url

  return (
    <>
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 group"
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
            {isVideo(item) ? (
              <video
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : isSupabaseUrl(mediaUrl) ? (
              <Image
                src={mediaUrl}
                alt={item.alt_text || ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt={item.alt_text || ''}
                className="w-full h-full object-cover"
              />
            )}
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
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
              onClick={() => setLightbox(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              className="relative max-w-5xl w-full max-h-[85vh] aspect-video"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              {isVideo(item) ? (
                <video src={mediaUrl} controls autoPlay className="w-full h-full object-contain rounded-xl" />
              ) : isSupabaseUrl(mediaUrl) ? (
                <Image src={mediaUrl} alt={item.alt_text || ''} fill className="object-contain rounded-xl" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl} alt={item.alt_text || ''} className="w-full h-full object-contain rounded-xl" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
