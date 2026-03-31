'use client'

import { useState } from 'react'
import { Sparkles, Check, X } from 'lucide-react'

interface AIEnhanceButtonProps {
  originalText: string
  context: string
  suggestionType?: 'improve' | 'preview_text' | 'title'
  onAccept: (text: string) => void
}

export default function AIEnhanceButton({
  originalText,
  context,
  suggestionType = 'improve',
  onAccept,
}: AIEnhanceButtonProps) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleEnhance() {
    if (!originalText.trim()) return
    setLoading(true)
    setError('')
    setSuggestion(null)
    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: originalText, context, suggestion_type: suggestionType }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSuggestion(data.suggestion)
    } catch {
      setError('Failed to connect. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleAccept() {
    if (suggestion) {
      onAccept(suggestion)
      setSuggestion(null)
    }
  }

  return (
    <div className="mt-1.5">
      {!suggestion ? (
        <button
          type="button"
          onClick={handleEnhance}
          disabled={loading || !originalText.trim()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {loading ? 'Enhancing…' : '✦ AI Enhance'}
        </button>
      ) : (
        <div className="mt-2 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 space-y-2">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wide">AI Suggestion</p>
          <p className="text-sm text-white/80 leading-relaxed">{suggestion}</p>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-white transition-colors"
            >
              <Check className="w-3 h-3" /> Accept
            </button>
            <button
              type="button"
              onClick={() => setSuggestion(null)}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
            >
              <X className="w-3 h-3" /> Discard
            </button>
          </div>
        </div>
      )}
      {error && !suggestion && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  )
}
