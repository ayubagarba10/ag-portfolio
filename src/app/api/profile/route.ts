import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('owner_profiles')
    .select('name, headline, profile_image_url, use_image_on_landing')
    .neq('name', '')
    .order('last_updated_at', { ascending: false })
    .limit(1)
    .single()
  return NextResponse.json(data ?? null)
}
