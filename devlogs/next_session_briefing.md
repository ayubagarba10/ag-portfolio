--- NEXT SESSION BRIEFING ---

PROJECT: AG Portfolio
WHAT IT DOES: Cinematic personal portfolio site with animated landing page, orbit navigation, AI gift box messages, owner dashboard, and Supabase-backed content management.

STACK: Next.js 16.2.1 (App Router, TypeScript), Framer Motion, Tailwind CSS, Supabase (Auth + PostgreSQL + Storage), Anthropic Claude API (Haiku), Vercel deployment

---

WHAT WAS WORKED ON THIS SESSION:

- Fixed all broken save/upload/sign-out operations in dashboard (try/catch, proper error feedback)
- Fixed onboarding infinite hang ("setting up..." forever) — added setLoading(false) in all exit paths, full try/catch, onConflict:'user_id' for upsert
- Added schema setup warning banner in dashboard when Supabase tables don't exist
- Fixed sign-out — now uses window.location.href instead of router.push for full reload (clears SSR cookies)
- Fixed orbit icon z-index: raised orbit container from z-[20] to z-[30] so tooltips render above profile card
- Fixed mobile orbit icons clipping at screen edges: added xs breakpoint card size (160×200px) and dynamic radius (150/190/240 per screen size)
- Fixed Stories/Connect tooltip overflow: narrower w-36 on mobile + smart left/right alignment based on icon position
- Centered the name/Welcome text inside the profile card (was left-aligned)
- Deployed to Vercel (ayubagarbausa-4101 / ag-portfolio-beta.vercel.app) with all 5 env vars set
- Set up GitHub Actions auto-deploy (every push to main triggers Vercel deploy)

---

WHAT IS STILL PENDING OR BROKEN:

CRITICAL — USER MUST DO MANUALLY:
1. Run supabase/schema.sql in Supabase SQL Editor:
   https://supabase.com/dashboard/project/kuuxkxaeubrthtmfywyo/sql/new
   Without this, ALL save operations will fail (tables don't exist yet)

2. Create storage bucket named "portfolio-media" (set to public) in:
   https://supabase.com/dashboard/project/kuuxkxaeubrthtmfywyo/storage/buckets
   Without this, photo uploads will fail

3. Create owner account in Supabase Auth:
   https://supabase.com/dashboard/project/kuuxkxaeubrthtmfywyo/auth/users
   Add email + password, then navigate to /login to complete onboarding wizard

PENDING FEATURES:
- Public section pages (/projects, /experience, /about, /stories) show placeholder content — need to pull and display real Supabase data
- Connect page — social links are stored but not displayed publicly
- Custom domain on Vercel not yet configured

---

IMPORTANT CONTEXT:

- Vercel account: ayubagarbausa-4101 | project: ag-portfolio | URL: ag-portfolio-beta.vercel.app
- Vercel token: [REDACTED — store in password manager, not in files]
- GitHub: ayubagarba10/ag-portfolio | push token: [REDACTED — store in password manager, not in files]
- Supabase project: kuuxkxaeubrthtmfywyo | URL: https://kuuxkxaeubrthtmfywyo.supabase.co
- proxy.ts (NOT middleware.ts) — Next.js 16 renamed it; exported function must be named 'proxy'
- Auth uses Supabase SSR cookies — sign-out MUST use window.location.href for full page reload
- Orbit nav: angle=0 → TOP, polar coordinates; radius 150/190/240 for xs(<640)/sm(640-767)/lg(≥768)
- Card sizes: xs: 160×200px | sm: 208×256px | lg: 256×320px
- Dashboard save buttons will silently return + show banner if owner_profiles table not set up
- Onboarding upsert uses onConflict:'user_id' to safely update existing profiles

SERIES TRACKER:
  Project name:      AG Portfolio
  Current part:      Part 4
  Last post summary: Fixed all save/upload/sign-out bugs, orbit z-index and mobile clipping, onboarding hang

--- END OF BRIEFING ---
