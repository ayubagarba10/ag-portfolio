import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses RLS entirely.
 * ONLY use in server components and API routes. Never import this in client components.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
