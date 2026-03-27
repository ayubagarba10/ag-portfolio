'use server'

import { createClient as createSSRClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates or updates the owner profile using the service role key.
 * This bypasses RLS to avoid silent failures when the browser client's
 * session token isn't yet reflected in the SSR cookie layer.
 * The user's session is verified first via the SSR cookie client.
 */
export async function setupOwnerProfile(profileData: {
  name: string
  headline: string
  bio: string
  profileImageUrl: string
}): Promise<{ data?: { id: string }; error?: string }> {
  // Verify user is authenticated via SSR cookies
  const supabase = await createSSRClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated. Please go back to /login and sign in again.' }
  }

  // Use service role client to bypass RLS for the initial profile upsert.
  // This is safe because we already verified the user's session above.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: owner, error } = await admin
    .from('owner_profiles')
    .upsert(
      {
        user_id: user.id,
        name: profileData.name,
        headline: profileData.headline,
        bio: profileData.bio,
        profile_image_url: profileData.profileImageUrl,
        onboarding_complete: true,
      },
      { onConflict: 'user_id' }
    )
    .select('id')
    .single()

  if (error) return { error: error.message }
  if (!owner) return { error: 'Profile was not created — please check your Supabase schema.' }
  return { data: owner }
}
