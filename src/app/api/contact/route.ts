import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { sender_name, sender_email, message } = await request.json()

    if (!sender_name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    if (!sender_email?.trim() || !EMAIL_RE.test(sender_email)) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required.' }, { status: 400 })

    // Find the completed owner profile (no need to expose owner_id in the request)
    const { data: owner } = await supabase
      .from('owner_profiles')
      .select('id')
      .eq('onboarding_complete', true)
      .limit(1)
      .single()

    if (!owner) return NextResponse.json({ error: 'Portfolio not configured.' }, { status: 404 })

    const { error } = await supabase.from('contact_messages').insert({
      owner_id: owner.id,
      sender_name: sender_name.trim(),
      sender_email: sender_email.trim().toLowerCase(),
      message: message.trim(),
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
