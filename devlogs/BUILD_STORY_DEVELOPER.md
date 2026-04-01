# AG Portfolio — Developer Build Story

**Stack:** Next.js 16.2.1 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Supabase (Auth + PostgreSQL + Storage) · Anthropic Claude API · Vercel
**Repo:** github.com/ayubagarba10/ag-portfolio
**Build period:** March 26 – March 31, 2026

---

## Overview

This document traces the full technical development of AG Portfolio — a cinematic, AI-assisted personal portfolio built from scratch over six days. It covers every major architectural decision, every bug that stopped progress, and every lesson learned. The project is not a template — every component, database schema, API route, and deployment configuration was written by hand.

---

## Part 1 — Initial Build (March 26)

### What was built

The entire foundation was scaffolded in a single session. Starting from a spec file (`My Profile.json`) and a professional photo, the goal was to produce a deployable portfolio that would stand apart from any template-based tool.

**Landing page architecture:**
The landing page runs a two-phase animation sequence. On first load, two door panels (left/right) fill the screen and animate open using Framer Motion's `AnimatePresence`. Once open, the cinematic hero fades in: a full-screen profile image with an ambient radial glow, a centered profile card (name, headline, status badge), and five orbit icons arranged in a polar coordinate layout around the card.

The orbit uses a mathematical polar layout rather than CSS flexbox. Each icon's position is calculated as:
```
x = cos(angle) * radius
y = sin(angle) * radius
```
with `angle = 0` mapping to the top (12 o'clock), consistent with standard compass notation. Orbit radii are 240px on desktop, 190px on tablet, 150px on mobile — sized to keep icons within the viewport at every breakpoint.

**Gift box feature:**
A persistent glowing gift icon renders on every page via the root layout. Clicking it opens a modal: the box lid animates away, confetti particles scatter using randomized keyframe positions, and the owner's photo reveals alongside an AI-generated message fetched from `/api/gift-message`. Each click generates a new message using Claude Haiku with a strictly constrained prompt. Gift box opens are tracked per owner in Supabase.

**Authentication and onboarding:**
Auth uses Supabase SSR with cookie-based sessions managed through `@supabase/ssr`. Route protection runs through `proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts` (the exported function must also be named `proxy`, not `middleware`). The onboarding wizard is a 5-step client component: photo upload → profile info → first project → social link → completion. Each step writes to Supabase immediately.

**Database schema:**
Eight tables on first deploy: `owner_profiles`, `projects`, `experiences`, `stories`, `media`, `social_links`, `page_visits`, `gift_messages`. All tables have Row Level Security enabled. The `media` table uses a polymorphic association pattern: `associated_entity_type` (text: 'project' | 'experience' | 'story') and `associated_entity_id` (uuid). No foreign key constraint — this is deliberate because a single media table serves multiple entity types and PostgreSQL FK constraints require a single target table.

**AI content suggestions:**
Every text field in the dashboard has an AI enhance button wired to `/api/ai-suggest`. The route accepts `original` text, a `context` string, and a `suggestion_type` ('title' | 'preview_text' | 'content'). It dispatches to one of three Anthropic functions: `optimizeTitle`, `generatePreviewText`, or `suggestImprovedContent`. All three use Claude Haiku with `max_tokens` set conservatively (60 / 120 / 500 respectively).

---

## Part 2 — Critical Bug: Everything Broken (March 26, same day)

### The problem

After completing the build, the owner tried to use the dashboard and found that nothing worked. Save Profile had no effect. Add Project inserted nothing. Onboarding hung at "Setting up…" indefinitely. Sign Out didn't navigate. Three separate interaction categories — dashboard, onboarding, and navigation — were all simultaneously broken.

### Root causes

**1. Silent save failures (the cascade root cause)**
All dashboard save functions began with `if (!owner) return`. The `owner` state was `null` because `loadAll()` failed on startup — the Supabase tables didn't exist yet because `schema.sql` had not been run in Supabase's SQL Editor. The error was swallowed silently. From the user's perspective, every button did nothing. From a code perspective, every button was correctly preventing a database write to a non-existent table.

**2. Onboarding infinite loading**
`handleFinish()` called `setLoading(true)` at the top. One code path had `if (!user) return` with no `setLoading(false)` — loading state would never clear. No `try/catch` existed anywhere in the function, so any runtime exception also left the spinner running forever.

**3. Sign-out SSR cookie problem**
`supabase.auth.signOut()` followed by `router.push('/')` clears client-side auth state but does not force a full HTTP response cycle. Supabase SSR sessions are stored as HTTP-only cookies set by server middleware. A client-side `push()` does not trigger a new server request with cleared cookies — the user remained authenticated at the SSR layer. Fix: `window.location.href = '/'` forces a full page reload, which triggers a new request where `proxy.ts` re-evaluates the cookie state.

**4. Orbit tooltip z-index confinement**
The orbit container had `z-[20]`, the profile card had `z-[25]`. A parent with `position` + `z-index` creates an isolated CSS stacking context — child `z-index` values are ranked within that context only, never against external stacking contexts. Tooltips inside the orbit at `z-[30]` were actually `z-30` within a context that sat below the card's `z-25` context. Fix: swap the DOM render order — card first at `z-[20]`, orbit second at `z-[30]`. No visual change; all tooltip overlaps now work correctly.

**5. Mobile orbit icon clipping**
On a 375px screen, the profile card is centered at 187.5px from the left. The Projects icon at orbit angle ≈ -180.7° from center placed its left edge at approximately -15px — clipping off-screen. Solution: introduce a new `xs` breakpoint for screens under 640px with orbit radius 150px, bringing all icons safely within a 375px viewport.

---

## Part 3 — Image and Data Fetching Bugs (March 27)

### The problem

Data was saving correctly to Supabase (verified in the dashboard UI) but public pages showed only empty placeholders. Every image on the site was invisible.

### Root causes

**1. Missing next.config.ts image domain allowlist (critical)**
`next/image` requires every external image hostname to be explicitly registered in `next.config.ts` under `images.remotePatterns`. The Supabase Storage domain (`*.supabase.co`) was not listed. Next.js silently rejects unregistered hostnames — no error is thrown, the Image component renders nothing. This blocked every single image on the site.

**2. PostgREST polymorphic join failure**
Both `stories/page.tsx` and `projects/page.tsx` used `select('*, media(url, alt_text)')`. PostgREST's embedded-resource syntax only works with formal foreign key constraints. The `media` table uses polymorphic associations (`associated_entity_type` + `associated_entity_id`) with no FK — PostgREST throws a `PGRST200` error. Supabase-js returns `data: null` on query errors. Because the page checked `stories && stories.length > 0`, a null result looked identical to an empty result. Pages always showed the "coming soon" placeholder regardless of saved content.

**Fix: two-step application-level join**
Query entities first with `select('*')`. Collect all entity IDs. Query media separately: `.in('associated_entity_id', entityIds).eq('associated_entity_type', 'story')`. Join in application code using a `Map`. This pattern is reliable regardless of DB schema and explicit about what's being joined.

---

## Part 4 — Contact Form and Personal Story (March 28)

New capabilities added this session:

- `personal_story` column on `owner_profiles` — displayed on the About page below the bio
- `contact_email_visible` boolean toggle — controls whether the contact form renders on `/connect`
- `contact_messages` table with asymmetric RLS: public users can `INSERT` (no auth required), authenticated owner can `SELECT` and `UPDATE`
- `/api/contact` POST route — validates fields, looks up the owner by `onboarding_complete = true`, inserts the message using the service role key (bypasses RLS)
- `ContactForm` client component — name, email, message fields with loading/success/error states
- Dashboard Messages tab — shows received messages with sender info, timestamp, unread badge, mark-as-read

Also fixed: Next.js server-side caching was serving empty pages even after content was saved. All five public pages received `export const dynamic = 'force-dynamic'` to opt out of static caching.

---

## Part 5 — Full Mobile Responsiveness (March 29)

### Architecture decisions

**BottomNav component**
Mobile navigation is a bottom bar, not a truncated top nav. `BottomNav.tsx` is a `md:hidden` fixed-position component with six tappable icons. It uses `usePathname()` for active state highlighting and `env(safe-area-inset-bottom)` padding (via a `.pb-safe` CSS utility) to clear the iPhone home indicator. Minimum tap target size is 44px on all items — matching Apple HIG and Google Material guidelines.

**MobileLandingGrid — separate component, not responsive orbit**
The orbit navigation is fundamentally a hover interaction model — it has no equivalent on touchscreens. Rather than forcing the orbit to work on touch (double-tap, gesture states), a completely separate `MobileLandingGrid.tsx` component was built: a 2×3 grid of section cards, each navigating on single tap. The landing page renders one or the other based on screen size using `hidden md:block` / `flex md:hidden`. The orbit's code is entirely unchanged.

**iOS zoom prevention**
iOS Safari automatically zooms when an input's font size is below 16px. All form inputs across the site were changed from `text-sm` (14px) to `text-base` (16px). `inputMode="email"` and `autoComplete` attributes were also added to the contact form email field.

**Dashboard layout**
The outer wrapper changed from `flex` (default row) to `flex flex-col md:flex-row`. On mobile, the tab bar stacks above the content. Without this, both the tab bar and content tried to share horizontal space on a 375px screen.

---

## Part 6 — Galleries, Series, Episodes, and Detail Pages (March 29 continued)

### New data model additions

**Story series and episodes:**
- `story_series` table: `id`, `owner_id`, `title`, `description`, `preview_text`, `slug`, `sort_order`
- `stories` table extended: `series_id` (FK to story_series), `episode_number` (integer), `preview_text`
- Stories can now be standalone articles or episodes within a named series

**Per-entity media galleries:**
- `media` table extended: `source_type` ('upload' | 'external_link'), `external_url`, `is_approved`, `sort_order`
- `projects` and `experiences` tables extended: `gallery_speed` (integer, default 5)
- Dashboard now builds per-entity `Map` objects: `projMediaMap[projectId]`, `expMediaMap[experienceId]`, `storyMediaMap[storyId]`

### New components

**MediaGallery:** Auto-rotating image/video gallery with configurable speed, Framer Motion fade transitions, navigation arrows, dot indicators, and a full-screen lightbox. Supports Supabase Storage URLs (via `next/image`) and external URLs (via `<img>`). Gallery pauses on hover.

**MediaInputPanel:** Two-tab upload panel. Upload tab handles file input → Supabase Storage → media record insertion. Link tab handles URL input with: auto-conversion of Google Drive URLs to direct format, YouTube/Vimeo embed detection, image preview via an `<img>` tag's `onLoad`/`onError`, and a "save anyway" escape hatch for URLs that fail preview.

**Detail pages:** Separate pages for `/projects/[slug]`, `/experience/[slug]`, `/stories/[slug]`, `/stories/[seriesSlug]/[episodeSlug]` — each with a two-column split: content left, media gallery right (sticky on desktop).

**StoryEpisodeCard:** Episode list item with episode number badge, title, preview text, date, and hover-animated Read link.

---

## Part 7 — Markdown, Sticky Header, Slug Fix (March 31)

### Slug uniqueness bug

`addStory()` generated slugs as `slugify(title)`. Two episodes with similar or identical titles would generate colliding slugs and crash with a PostgreSQL unique constraint violation. Fix: append a 5-character random suffix at generation time — `slugify(title) + '-' + Math.random().toString(36).slice(2, 7)`. Slug is never regenerated on edit, preserving existing deep links. The `episode_label` field was added as a free-text display string separate from `episode_number` (which controls sort order only).

### Markdown rendering

`react-markdown` + `remark-gfm` + `dompurify` were installed. A `MarkdownRenderer` component was created with fully custom component overrides mapping every Markdown element to Tailwind-styled JSX. `DOMPurify.sanitize()` runs on the client side before rendering (guarded by `typeof window !== 'undefined'` for SSR safety — `react-markdown` does not execute HTML by default, making server-side rendering safe without DOMPurify). Markdown now renders in: EpisodeDetail, StoryDetail, ProjectDetail, ExperienceDetail, About page bio, About page personal story, and series description. Dashboard textareas received "(supports Markdown)" placeholder text and a live "Preview markdown" toggle.

### Sticky navigation

`PageShell.tsx` nav changed from `relative z-10` to `sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm`. One change, all public pages covered. Sticky gallery offsets in detail pages updated from `lg:top-6` to `lg:top-24` to prevent the gallery from hiding behind the fixed nav.

### Portrait image display

`MediaGallery.tsx` container changed from `aspect-video` to `h-[300px] md:h-[400px]`. Image CSS changed from `object-cover` to `object-contain`. Portrait images now display in full without cropping. Videos retain `object-cover`. Lightbox changed from `aspect-video` to `h-[80vh]`.

### Series gallery

The public series page was restructured into a two-column layout: episode list left, auto-rotating gallery right. Gallery column only renders if the series has attached media — if empty, content fills full width. Media is fetched from the `media` table filtered by `associated_entity_type = 'series'` and `associated_entity_id = series.id`. The dashboard edit series form received `MediaInputPanel` + `MediaMiniGrid` to support attaching images.

### Google Drive URL reliability

The URL converter was rewritten to extract file IDs from all Drive URL patterns and convert to `lh3.googleusercontent.com/d/FILE_ID` — the most reliable format for direct image embedding, not subject to sharing setting restrictions in the same way as the `/uc?export=view` and `/thumbnail` endpoints.

---

## Architecture Summary

```
src/
├── app/
│   ├── page.tsx                         — Landing (orbit + mobile grid)
│   ├── projects/page.tsx                — Projects list
│   ├── projects/[slug]/page.tsx         — Project detail
│   ├── experience/page.tsx              — Experience list
│   ├── experience/[slug]/page.tsx       — Experience detail
│   ├── about/page.tsx                   — About (bio, social links)
│   ├── stories/page.tsx                 — Stories + series list
│   ├── stories/[seriesSlug]/page.tsx    — Series + episode list + gallery
│   ├── stories/[seriesSlug]/[slug]/     — Episode detail
│   ├── stories/post/[slug]/page.tsx     — Standalone story detail
│   ├── connect/page.tsx                 — Contact form
│   ├── login/page.tsx                   — Owner auth
│   ├── onboarding/page.tsx              — 5-step onboarding wizard
│   ├── dashboard/page.tsx               — Owner dashboard (8 tabs)
│   └── api/
│       ├── gift-message/route.ts        — Claude Haiku gift message
│       ├── ai-suggest/route.ts          — AI content suggestion
│       ├── contact/route.ts             — Contact form submission
│       └── messages/route.ts            — Message retrieval
├── components/
│   ├── landing/
│   │   ├── WelcomeAnimation.tsx         — Door open animation
│   │   ├── CinematicHero.tsx            — Full-screen hero
│   │   ├── OrbitNav.tsx                 — Polar orbit navigation (desktop)
│   │   └── MobileLandingGrid.tsx        — Grid navigation (mobile)
│   ├── gift/
│   │   ├── GiftBoxIcon.tsx              — Persistent gift button
│   │   ├── GiftBoxModal.tsx             — Animated modal + AI message
│   │   └── GiftBoxWrapper.tsx           — Client wrapper for SSR
│   ├── sections/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── ExperienceTimeline.tsx
│   │   ├── ExperienceDetail.tsx
│   │   ├── StoryPost.tsx
│   │   ├── StoryDetail.tsx
│   │   ├── EpisodeDetail.tsx
│   │   ├── StoryEpisodeCard.tsx
│   │   └── ContactForm.tsx
│   └── ui/
│       ├── PageShell.tsx                — Sticky nav + page wrapper
│       ├── BottomNav.tsx                — Mobile bottom navigation
│       ├── MediaGallery.tsx             — Auto-rotating gallery + lightbox
│       ├── MediaInputPanel.tsx          — Upload + link paste panel
│       ├── MarkdownRenderer.tsx         — Markdown → styled HTML
│       ├── AIEnhanceButton.tsx
│       └── MediaMiniGrid.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/service.ts
│   ├── anthropic.ts                     — suggestImprovedContent, generatePreviewText, optimizeTitle, generateGiftMessage
│   └── utils.ts                         — slugify
├── proxy.ts                             — Route protection (Next.js 16)
└── app/globals.css                      — overscroll-behavior, pb-safe
```

---

## Database Schema (final state)

| Table | Key columns |
|-------|-------------|
| `owner_profiles` | id, user_id, name, headline, bio, personal_story, profile_image_url, onboarding_complete, contact_email_visible, use_image_on_landing |
| `projects` | id, owner_id, title, description, slug, external_link, preview_text, gallery_speed, sort_order |
| `experiences` | id, owner_id, role, company, description, slug, start_date, end_date, is_current, preview_text, gallery_speed, sort_order |
| `stories` | id, owner_id, series_id, title, content, slug, episode_number, episode_label, gallery_speed_seconds, preview_text, sort_order |
| `story_series` | id, owner_id, title, description, preview_text, slug, sort_order |
| `media` | id, owner_id, url, media_type, alt_text, associated_entity_type, associated_entity_id, source_type, external_url, is_approved, sort_order |
| `social_links` | id, owner_id, platform_name, url, sort_order |
| `page_visits` | id, owner_id, page_name, visited_at |
| `gift_messages` | id, owner_id, opened_at |
| `contact_messages` | id, owner_id, sender_name, sender_email, message, is_read, received_at |

All tables: RLS enabled. Public users: read-only on content tables, insert-only on contact_messages and page_visits. Authenticated owner: full access to own rows via `owner_id = (SELECT id FROM owner_profiles WHERE user_id = auth.uid())`.

---

## Key Technical Lessons

**CSS stacking contexts are isolated.** Setting `z-index: 9999` on a child doesn't help if the parent stacking context sits below another element. Fix at the stacking context level, not the child.

**Supabase PostgREST embedded resources require FK constraints.** Polymorphic associations (`entity_type + entity_id`) cannot use PostgREST join syntax. Always use two-step application-level joins for polymorphic relations.

**next/image requires explicit domain allowlisting.** Failing to register `remotePatterns` produces no error — images just silently render nothing.

**Next.js 16 renamed middleware.** `middleware.ts` → `proxy.ts`, exported function `proxy` not `middleware`. No deprecation warning at build time.

**Supabase SSR sign-out requires full page reload.** `router.push()` does not clear HTTP-only SSR session cookies. `window.location.href = '/'` is required.

**Markdown is a better default than plain text.** Storing content as Markdown costs nothing if the user writes plain paragraphs — they're valid Markdown. But it unlocks formatting for free when needed, with no schema migration.

**Slug uniqueness must be guaranteed at generation time.** Validating for duplicates before insert is a race condition. Adding entropy (random suffix) at generation time is the correct solution.

**Mobile layout is a separate design problem.** The orbit is a hover interaction model that doesn't translate to touch. Building a separate `MobileLandingGrid` component was more correct than trying to make the orbit work on touchscreens.
