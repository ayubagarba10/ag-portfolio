Dev Log — 2026-03-31

Project: AG Portfolio | Part: 7

---

Problem Noticed

Three problems were blocking the site from being usable as a real content platform.

**Story slug crash:**
Every time I tried to create a new episode in the same series, the database threw a "duplicate key value violates unique constraint stories_slug_key" error. The slug was being generated purely from the episode title — so two episodes with similar or identical titles would collide. I had to delete and recreate episodes in the exact right sequence just to avoid crashes. That's not a workflow, that's a workaround.

**Content looked raw:**
All the text I wrote for stories, episodes, projects, and experience descriptions showed up as one flat block of plain text. There was no way to add a heading, bold a key phrase, or format a bullet list. The content looked unpolished compared to the care I put into writing it. I wanted to paste Markdown and have it render properly — the same way I write everything else.

**Header disappears while reading:**
On long content pages — especially episode detail pages — the navigation bar (Home, Projects, Stories, etc.) would scroll off the top as I read down the page. To navigate back, I had to scroll all the way to the top first. On a site meant to be read, that's a real usability problem.

There were also smaller issues: portrait images were getting cropped to landscape containers, Google Drive image links were unreliable for certain URL formats, and the right side of the episode detail view sat empty unless media was already attached.

---

Root Cause

**Slug collision:**
The `addStory()` function was calling `slugify(title)` with no disambiguation — so `"The Breath"` and `"The Breath"` (episode 2 retitled) would generate identical slugs. The database has a global unique constraint on `slug`, not a per-series one, so any collision anywhere would crash the insert. The slug generation had no randomness, no suffix, no guard.

**Plain text rendering:**
Content was being split by newlines into `<p>` tags and rendered as-is. No Markdown parsing library was installed. Every formatting convention I used (dashes, asterisks, pound signs) appeared literally as characters instead of rendered formatting.

**Scrolling header:**
The `<nav>` element in `PageShell.tsx` had `position: relative`, meaning it sat in the normal document flow and scrolled away with the page. Making it sticky requires `position: sticky; top: 0` plus a background so content scrolling beneath it doesn't bleed through.

**Portrait images cropped:**
`MediaGallery.tsx` was using `object-cover` with an `aspect-video` container. Cover fills the container by cropping — which works for landscape images but slices off the top and bottom of portrait ones.

**Google Drive URL patterns:**
The URL converter only handled `/file/d/FILE_ID` format. Drive links shared via "copy link" often use `/open?id=FILE_ID` or `/uc?id=FILE_ID` instead — those were falling through unconverted and failing to preview.

---

How It Was Fixed

**Slug collision — fixed at the generation step:**
Changed `addStory()` to append a short random 5-character suffix to every new slug:
```
slugify(title) + '-' + Math.random().toString(36).slice(2, 7)
```
This makes every slug globally unique regardless of title. The `updateStory()` function was intentionally left untouched — slugs never change after creation so existing links stay stable.

**Added episode_label field:**
Added a free-text "Episode label" field (e.g. "Episode 1", "Bonus", "Finale") separate from the sort-order `episode_number`. The breadcrumb and episode header now show the label, falling back to "Episode N" if empty. Required an `ALTER TABLE stories ADD COLUMN episode_label` migration plus dashboard form inputs.

**Markdown rendering — installed react-markdown + remark-gfm + dompurify:**
Created a shared `MarkdownRenderer` component styled to match the portfolio's visual language: white headings, `white/70` body text, amber links, styled lists and blockquotes, inline code in amber, fenced code blocks with a dark background. Replaced plain-text rendering in EpisodeDetail, StoryDetail, ProjectDetail, ExperienceDetail, and the About page bio/personal story. All existing content continues to display — plain paragraphs are valid Markdown.

**Dashboard Markdown preview:**
Added a "Preview markdown" toggle button beneath every content textarea in the dashboard. Clicking it shows a live rendered preview of the current content using `MarkdownRenderer`. This means I can see exactly how the content will look before saving.

**Sticky navigation — one-line fix:**
Changed the `<nav>` className in `PageShell.tsx` from `relative z-10` to `sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm`. Because every public page uses `PageShell`, this single change covers all of them — projects, experience, about, stories, connect, all detail pages. Also updated the sticky gallery offset in detail pages from `top-6` to `top-24` so the gallery doesn't hide behind the nav.

**Portrait image fix:**
Changed `MediaGallery.tsx` main container from `aspect-video` to `h-[300px] md:h-[400px]` and changed image rendering from `object-cover` to `object-contain`. Portrait images now show in full with dark padding on the sides rather than being cropped. Videos keep `object-cover` since video content is almost always landscape. The lightbox was already using `object-contain` and now uses `h-[80vh]` for the container.

**Google Drive URL patterns:**
Updated `convertToDirectUrl()` in `MediaInputPanel.tsx` to handle three URL patterns: `/file/d/`, `/open?id=`, and `/uc?id=`. All three now convert to the thumbnail endpoint format that reliably loads. Updated the error message to include a Google Drive sharing tip when preview fails.

**AI suggestions now return Markdown:**
Updated the `suggestImprovedContent` prompt in `src/lib/anthropic.ts` to instruct the AI to use Markdown formatting (bold, headings, lists) in its suggestions — so accepted suggestions drop in cleanly without needing manual reformatting.

---

Files Changed

- `src/app/dashboard/page.tsx` — slug fix, episode_label + gallery_speed states and form inputs, Markdown preview toggle, updated insert/update payloads
- `src/components/ui/PageShell.tsx` — sticky nav (one-line change)
- `src/components/ui/MarkdownRenderer.tsx` — new component
- `src/components/sections/EpisodeDetail.tsx` — MarkdownRenderer, episode_label, gallery_speed_seconds prop, sticky offset
- `src/components/sections/StoryDetail.tsx` — MarkdownRenderer, sticky offset
- `src/components/sections/ProjectDetail.tsx` — MarkdownRenderer, sticky offset
- `src/components/sections/ExperienceDetail.tsx` — MarkdownRenderer, sticky offset
- `src/app/about/page.tsx` — MarkdownRenderer for bio and personal_story
- `src/components/ui/MediaGallery.tsx` — fixed height containers, object-contain for images, lightbox container fix
- `src/components/ui/MediaInputPanel.tsx` — Google Drive URL pattern handling, improved error message
- `src/lib/anthropic.ts` — Markdown instruction in AI suggestion prompt
- `supabase/schema.sql` — Part 7 migration (episode_label, gallery_speed_seconds)
- `package.json` / `package-lock.json` — react-markdown, remark-gfm, dompurify added

---

What I Learned

Slug uniqueness is not the same as title uniqueness. Titles can repeat — that's intentional in a series. Slugs must be globally unique because they are URLs. The right fix is to add entropy at generation time (a random suffix), not to try to validate or deduplicate later. Once a slug is published it should never change.

Markdown is a better default for content than plain text. Even if I don't use any formatting now, storing and rendering Markdown means I can add formatting later without a migration — plain paragraphs are already valid Markdown. The upgrade path is free.

A sticky header is not just a visual preference — it's a navigation contract. Visitors should never have to scroll up to find out where they are or how to leave a page. One CSS rule change covering every public page was worth doing before anything else got more complex.
