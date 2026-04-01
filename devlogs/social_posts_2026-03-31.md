Social Posts — 2026-03-31 | AG Portfolio Part 7

---

LinkedIn

Every time I tried to add a new episode to my portfolio site, the database crashed.

"duplicate key value violates unique constraint stories_slug_key"

The bug: story slugs were being generated from the episode title. Two episodes with similar titles → identical slugs → crash. I had to create episodes in perfect order, never rename anything, never duplicate a title. That's not a workflow. That's walking on eggshells.

Fix: append a short random suffix to every slug at creation time.

`slugify(title) + '-' + Math.random().toString(36).slice(2, 7)`

Done. Every slug is now globally unique regardless of title or order. The `updateStory()` function stays untouched — once a slug is a URL, it should never change.

This session also had three other quality-of-life upgrades I'd been putting off:

**Markdown rendering.** Content was displaying as raw plain text. Installed react-markdown and built a shared MarkdownRenderer component. Stories, projects, experience descriptions, and the About page bio now render headings, bold, lists, links, and code blocks. Added a live preview toggle in the dashboard so I can see exactly how content looks before saving.

**Sticky navigation.** The site header was scrolling away on long reading pages. One line of CSS in one file (`sticky top-0 z-50`) — fixed on every public page simultaneously because they all share the same layout component.

**Portrait image support.** The media gallery was using `object-cover` with a landscape container, cropping the top and bottom off tall images. Changed to `object-contain` with a fixed height — the full image shows now, with dark padding on the sides for portraits.

Small fixes, big difference in how the site actually feels to use.

Part 8 coming.

#buildinpublic #nextjs #typescript #webdevelopment #portfolioproject #softwaredevelopment

---

Facebook

My portfolio site was crashing every time I tried to add a new episode.

The error: "duplicate key value violates unique constraint." The fix turned out to be one line — add a random 5-character suffix when generating the slug so two stories with similar titles can never collide.

While I was in the codebase I also fixed three other things that had been bothering me:

→ All content now renders as Markdown — so I can use bold text, headings, bullet lists, and links in my stories and project descriptions instead of plain paragraphs
→ The navigation bar is now sticky — it stays at the top while you scroll through long pages instead of disappearing
→ Portrait images now show in full instead of getting cropped to fit a landscape container

The Markdown change was the most satisfying. I write everything in Markdown anyway — now the site actually renders it the way I intended.

What formatting do you use when writing content for a website? 👇

#buildinpublic #webdev #nextjs

---

Instagram

Part 7 of my portfolio build — fixed a database crash that was blocking me from adding episodes.

The bug was in slug generation. Every episode was getting a slug from its title alone — so two similar titles would generate the same slug and crash on insert.

One-line fix: add a random suffix. Every slug is now unique by design.

While fixing that I also:

→ Added Markdown rendering to every content page (stories, projects, experience, about)
→ Made the navigation sticky so it stays visible while scrolling
→ Fixed portrait images getting cropped in the gallery

The site is starting to feel like something real to use, not just something that exists.

Details in the devlog 🔗 in bio.

#buildinpublic #nextjs #typescript #webdev #portfoliobuilder #devlog #coderlife #100daysofcode #javascript #softwaredevelopment #markdown
