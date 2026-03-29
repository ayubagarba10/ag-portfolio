'use client'

import { useState } from 'react'
import { Send, Check } from 'lucide-react'

export default function ContactForm() {
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_name: senderName, sender_email: senderEmail, message }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
          <Check className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-white font-medium mb-1">Message sent!</p>
        <p className="text-white/40 text-sm">Thanks for reaching out. I'll get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="text-xs text-white/40 mb-1.5 block">Your name</label>
        <input
          type="text"
          value={senderName}
          onChange={e => setSenderName(e.target.value)}
          required
          placeholder="Jane Smith"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-white/20 focus:outline-none focus:border-white/30 min-h-[44px]"
        />
      </div>
      <div>
        <label className="text-xs text-white/40 mb-1.5 block">Your email</label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={senderEmail}
          onChange={e => setSenderEmail(e.target.value)}
          required
          placeholder="jane@example.com"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-white/20 focus:outline-none focus:border-white/30 min-h-[44px]"
        />
      </div>
      <div>
        <label className="text-xs text-white/40 mb-1.5 block">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="What's on your mind?"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none"
        />
      </div>

      {error && (
        <p className="text-rose-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
