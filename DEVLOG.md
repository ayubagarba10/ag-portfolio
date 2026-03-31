# AG Portfolio — Development Log

---

## 2026-03-30 — Part 6: Galleries, Series, Sub-pages + Bug Fixes

### Features shipped

**Experience & Projects — clickable cards + detail pages**
- Replaced flat timeline/card views with animated preview cards (`ExperienceCard`, updated `ProjectCard`)
- Each card links to a detail sub-page (`/experience/[slug]`, `/projects/[slug]`) with a split layout: formatted content on the left, rotating image gallery on the right
- Gallery speed is configurable per entity (2–15 seconds per image) via a dashboard slider
- Shareable deep links for every experience and project entry

**Media gallery**
- New `MediaGallery` component with auto-rotation, pause-on-hover, left/right navigation, dot indicators, and fullscreen lightbox
- Supports Supabase-hosted files, external URLs (Google Drive, etc.), and video files
- Dashboard now shows a `MediaMiniGrid` per entity with delete + replace controls

**External media URLs**
- `MediaInputPanel` supports both file upload and pasting an external URL
- Google Drive sharing links are automatically converted to direct-access format (`/uc?export=view&id=...`)
- YouTube and Vimeo links show an embed preview
- If a preview can't load client-side, a "Save anyway" fallback lets the owner persist the URL manually

**Stories — Series & Episodes**
- New `story_series` table with title, description, preview text, cover image, and slug
- Stories can be assigned to a series with an explicit episode number
- New pages: `/stories/[seriesSlug]` (episode list) and `/stories/[seriesSlug]/[episodeSlug]` (episode detail)
- `StoryEpisodeCard` always shows an episode badge (Ep N) — falls back to position index if no explicit number is set

**Standalone story detail pages**
- Story cards on `/stories` are now clickable, navigating to `/stories/post/[slug]`
- Detail page uses the same split layout (content left, gallery right if media exists)

**Dashboard expansions**
- Per-entity: preview text field with AI enhance, gallery speed slider, gallery images section (upload + paste link)
- Story Series CRUD: create, edit, delete series; assign stories to a series with episode numbers
- AI enhance on titles and preview text for projects, experiences, stories, and series
- Creating an experience or story now auto-opens the edit form so gallery images can be added immediately
- Replace button on every media thumbnail — swap a file or URL without losing the media record

**AI content generation**
- New `generatePreviewText()` and `optimizeTitle()` functions using `claude-haiku-4-5-20251001`
- `/api/ai-suggest` extended with `suggestion_type: 'improve' | 'preview_text' | 'title'`

### Schema changes (Part 6 — run in Supabase SQL Editor)
- `experiences`: added `slug`, `preview_text`, `gallery_speed`
- `projects`: added `preview_text`, `gallery_speed`
- `media`: added `source_type`, `external_url`, `is_approved`, `sort_order`
- New table: `story_series` with RLS policies
- `stories`: added `series_id`, `episode_number`, `preview_text`

### Files added
- `src/components/ui/MediaGallery.tsx`
- `src/components/ui/AIEnhanceButton.tsx`
- `src/components/ui/MediaInputPanel.tsx`
- `src/components/sections/ExperienceCard.tsx`
- `src/components/sections/ExperienceDetail.tsx`
- `src/components/sections/ProjectDetail.tsx`
- `src/components/sections/StorySeriesCard.tsx`
- `src/components/sections/StoryEpisodeCard.tsx`
- `src/components/sections/StoryDetail.tsx`
- `src/app/experience/[slug]/page.tsx`
- `src/app/projects/[slug]/page.tsx`
- `src/app/stories/[seriesSlug]/page.tsx`
- `src/app/stories/[seriesSlug]/[episodeSlug]/page.tsx`
- `src/app/stories/post/[slug]/page.tsx`
- `src/app/stories/StoriesClient.tsx`

### Files modified
- `portfolio/supabase/schema.sql` — Part 6 additions
- `portfolio/next.config.ts` — wildcard HTTPS image domain
- `src/lib/anthropic.ts` — new AI functions
- `src/app/api/ai-suggest/route.ts` — suggestion_type routing
- `src/app/experience/page.tsx` — ExperienceCard grid
- `src/components/sections/ProjectCard.tsx` — Link wrapper, preview_text
- `src/app/stories/page.tsx` — series + standalone fetch
- `src/app/stories/StoriesClient.tsx` — tabs, updated media interface
- `src/components/sections/StoryPost.tsx` — clickable, external URL image handling
- `src/components/sections/StoryEpisodeCard.tsx` — always-visible episode badge
- `src/app/dashboard/page.tsx` — all new dashboard sections
