Social Media Post — 2026-03-27

---

**Twitter / X (short)**

Been building my personal portfolio and hit a wall today — saves worked, data was in Supabase, but the public pages showed nothing. Turns out two lines in my config were responsible for 80% of the chaos.

next.config.ts had no image domains — Next.js was silently blocking every Supabase Storage URL.

And `select('*, media(url, alt_text)')` — PostgREST needs a real FK to do embedded selects. Polymorphic associations don't count. The whole query failed silently.

Data fetching is working now. Stories, projects, and the profile photo are finally live. 🚀

#buildinpublic #nextjs #supabase #devlog

---

**LinkedIn (longer)**

Something I want to share for anyone building a portfolio with Next.js + Supabase — two silent bugs that cost me hours.

**Bug 1: next/image and remote domains**
I had images uploading successfully to Supabase Storage. The URLs were being saved to the database. But nothing was showing on the site. No error, no warning — just blank space where the image should be.

The reason: `next/image` requires you to explicitly allowlist every external hostname in `next.config.ts` under `images.remotePatterns`. If a hostname isn't listed, Next.js returns an empty image *silently*. One line in the config — `hostname: '*.supabase.co'` — fixed every image on the site at once.

**Bug 2: PostgREST embedded resources and polymorphic associations**
My Stories and Projects pages used `select('*, media(url, alt_text)')` — the Supabase/PostgREST syntax for fetching related records in one query. The problem: this only works when there's a proper foreign key constraint between the two tables. My media table used a polymorphic pattern (`associated_entity_type` + `associated_entity_id`) with no FK. PostgREST returned a "Could not find a relationship" error — and Supabase-js silently sets `data: null` on errors. The page assumed null = empty and showed the "coming soon" placeholder even when 10 stories were saved.

The fix: split into two queries. Fetch the main records first, then fetch media separately using `.eq('associated_entity_type', 'story').in('associated_entity_id', [...ids])`, and join in JavaScript.

Small lessons, big impact. The portfolio is now live with real content rendering.

#webdev #nextjs #supabase #buildinpublic #portfolio #fullstack
