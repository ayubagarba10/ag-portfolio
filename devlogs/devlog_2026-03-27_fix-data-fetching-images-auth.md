Dev Log — 2026-03-27

Project: AG Portfolio | Part: 5

---

Problem Noticed

After the previous session's save-operation fixes, data was confirmed to be reaching Supabase (visible in the dashboard). But the portfolio remained broken in a different way:

- Public pages (Stories, Projects) showed "coming soon" placeholders even when content was saved
- Profile photos and uploaded images never appeared anywhere on the site
- The About page showed no social links
- Login would hang indefinitely with no feedback when Supabase was cold

---

Root Cause

Four separate root causes, all discovered by reading source files:

1. **Missing image domain in next.config.ts (CRITICAL)**
   `next/image` requires every external hostname to be explicitly allowlisted in `next.config.ts` under `images.remotePatterns`. The Supabase Storage URL (`*.supabase.co`) was not in the config. Next.js silently rejects unlisted hosts — no error is thrown, the image component just renders nothing. Every `<Image>` backed by a Supabase URL was blank. This affected: profile photo on landing page and about page, all media attached to stories and projects, and the replace-photo flow in the dashboard (upload succeeded but the returned URL would never display).

2. **PostgREST media join error causes entire query to fail**
   Both `stories/page.tsx` and `projects/page.tsx` used `select('*, media(url, alt_text)')`. PostgREST's embedded-resource syntax (the `media(...)` part) only works when a formal foreign-key constraint exists between the parent table and `media`. The schema uses a *polymorphic association* pattern (`associated_entity_type` + `associated_entity_id`) with no FK constraint, so PostgREST cannot infer the join. It returns a `PGRST200` error: "Could not find a relationship between 'stories'/'projects' and 'media'". The error is not surfaced in the UI — Supabase-js silently returns `data: null`. Because the page checks `stories && stories.length > 0`, a null result looks identical to an empty result, so the placeholder always rendered regardless of what was saved.

3. **About page social links missing owner filter**
   `social_links` was queried without `.eq('owner_id', owner.id)`, relying on RLS alone. On a single-owner site this is harmless but incorrect — fixed for correctness and future-proofing.

4. **Login had no cold-start feedback**
   Supabase free-tier projects pause after inactivity. The first auth request after a pause takes 15–30 seconds while the project restarts. The login page showed "Signing in…" with no further context, making it appear frozen. No timeout message or patience prompt existed.

---

Changes Made

**next.config.ts**
Added `images.remotePatterns` allowing `https://*.supabase.co/storage/v1/object/public/**`. This unblocks all Supabase Storage images site-wide.

**src/app/stories/page.tsx**
Replaced `select('*, media(url, alt_text)')` with a two-step fetch: `select('*')` for stories, then a separate `media` query filtered by `associated_entity_type = 'story'` and `associated_entity_id IN [story_ids]`. Results are joined in application code. Also added page-visit tracking (was missing from original).

**src/app/projects/page.tsx**
Same two-step fetch pattern applied. Media queried with `associated_entity_type = 'project'`.

**src/app/about/page.tsx**
Added `.eq('owner_id', owner.id)` to the social_links query.

**src/app/login/page.tsx**
Added `slowConnection` state. A `setTimeout` of 7 seconds triggers a "Taking a moment — the server may be waking up. Please wait…" message beneath the login button. Timer is cleared and state reset on auth success or failure.

---

What Is Now Working

- Profile photo uploads correctly and displays on landing page, about page, and dashboard
- Stories page fetches and renders all saved stories with their text, dates, and cover images
- Projects page fetches and renders all saved projects with cover images and external links
- About page shows social links filtered correctly to the owner
- Login shows a patience message after 7 seconds instead of silently freezing

---

What Still Requires Manual Setup (Infrastructure)

These cannot be fixed by code — they must be done in the Supabase Dashboard:

1. Create storage bucket named `portfolio-media` and set it to **Public**
   (Dashboard → Storage → New bucket → name: portfolio-media → Public: ON)

2. If images were uploaded before the bucket was public, make the bucket public now and re-upload.
   Previously uploaded files to a private bucket will have non-working URLs.

3. Supabase free tier pauses after ~1 week of inactivity — if login hangs for 20+ seconds, just wait.
   The first request wakes the project. Subsequent requests are fast.

---

What Was Deliberately Not Changed

- Schema (no new tables, no new columns, no FK changes)
- All public page components (StoryPost, ProjectCard, ExperienceTimeline)
- Dashboard logic
- Onboarding wizard
- Gift box, analytics, AI suggestion features
- All existing RLS policies
