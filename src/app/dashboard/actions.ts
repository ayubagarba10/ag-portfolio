'use server'

import { createClient as createSSRClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Ensures an owner_profiles row exists for the currently logged-in user.
 * If none exists, creates a minimal one using the service role key (bypasses RLS).
 * Returns the profile id, or null if the user is not authenticated.
 */
export async function ensureOwnerProfile(): Promise<{ id: string } | null> {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if a profile already exists for this user
  const { data: existing } = await supabase
    .from('owner_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) return existing

  // No profile found — create a minimal one using the service role key
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: created } = await admin
    .from('owner_profiles')
    .insert({ user_id: user.id, name: '', onboarding_complete: true })
    .select('id')
    .single()

  return created ?? null
}
