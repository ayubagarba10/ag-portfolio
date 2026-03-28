import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

async function getOwnerFromSession() {
  const serverClient = await createClient()
  const { data: { session } } = await serverClient.auth.getSession()
  if (!session) return null

  const supabase = createServiceClient()
  const { data: owner } = await supabase
    .from('owner_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  return owner
}

export async function GET() {
  const owner = await getOwnerFromSession()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('owner_id', owner.id)
    .order('submitted_at', { ascending: false })

  return NextResponse.json(messages ?? [])
}

export async function PATCH(request: NextRequest) {
  const owner = await getOwnerFromSession()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', id)
    .eq('owner_id', owner.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
