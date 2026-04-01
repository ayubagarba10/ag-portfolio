# AG Portfolio — The Story Behind the Build

**A cinematic personal portfolio built from scratch in six days.**

---

## The Problem With Every Portfolio Template

Most portfolios look the same.

A headshot. A list of projects. A PDF resume link. A contact form that may or may not be monitored. Templates make it easy to exist online — but they also make it impossible to stand out.

The person building this portfolio had a different starting point. The requirement wasn't just a place to put credentials. It was a digital space that would make a recruiter stop scrolling, make a friend feel genuinely welcomed, and make anyone who landed on it feel like they'd encountered something that couldn't have been made by anyone else.

That's a completely different design brief.

---

## What Was Built

**AG Portfolio** is a full-stack personal portfolio website — not a theme, not a no-code builder, not a modified template. Every component, every animation, every database table, and every API integration was written from scratch.

The site has two audiences: **visitors** who see a polished, cinematic experience, and **the owner** who manages all content through a private dashboard without ever touching code.

---

## The Experience Visitors Get

### The Entrance

The first thing you see is not a hero section. It's a pair of doors.

Two dark panels fill the screen. They open — slowly, deliberately — like the entrance to somewhere that matters. Behind them: a full-screen portrait, a soft ambient glow, and five floating icons arranged in a circle around the photo.

This is the orbit navigation. Each icon represents a section of the portfolio. Hover over one — a preview appears. Click it — you go there. The door animation only plays on your first visit. After that, the hero loads immediately.

The entire interaction takes about three seconds. In those three seconds, the site has already communicated more about the person behind it than most portfolios do in their entirety.

### The Gift Box

At the bottom-right corner of every single page — a glowing gift icon.

Click it. The box opens. Confetti scatters. The owner's photo appears. And a message appears — written specifically for you, in this moment, by an AI that has been given one instruction: say something genuinely encouraging. Not generic. Not scripted. Something that actually lands.

Every click generates a new message. No two are the same.

This feature exists for one reason: most portfolios take from the visitor (their time, their attention, their judgment). This one gives something back. It's a small gesture — but it reframes the entire relationship between the site and the person visiting it.

### The Content

Each section — Projects, Experience, About, Stories, Connect — lives at its own permanent URL. Every project has a detail page. Every role has a detail page. Every story and episode has a detail page.

These aren't just good for SEO. They're shareable. You can send someone directly to a specific project with a link that looks like this: `portfolio.com/projects/waypoint`. No login required, no scrolling, no hunting.

Content is written in Markdown, which means it renders with real formatting: headings, bold text, bullet lists, blockquotes, links. Stories read like articles, not like database dumps.

Each project and experience page has an image gallery on the right — auto-rotating, with a lightbox for closer inspection. Stories organized into series show the full episode list on the left and a gallery on the right. On mobile, everything stacks into a clean, readable single column.

### The Stories Feature

This is not a blog in the traditional sense. Stories are organized into series — thematic collections of episodes that can be published over time. Each episode is numbered, labeled, and deep-linked.

The 90-Day Appreciation Journey is one example: a series of daily reflections, each a few hundred words, collectively telling a longer story about what it means to be grateful for things you normally take for granted. Visitors can read one episode on a Tuesday afternoon and find their way back to the next one a week later.

This kind of long-form, episodic publishing is rare on a personal portfolio. It signals something important: this person has things to say that are worth following.

---

## How the Owner Controls Everything

### The Dashboard

There is no CMS subscription, no third-party admin panel, no per-seat pricing. The owner has a private dashboard at `/dashboard` — protected by Supabase authentication — where they can manage every piece of content on the site.

Eight tabs:

- **Profile** — name, headline, bio, personal story, profile photo, social links
- **Projects** — add, edit, reorder, attach images and external links
- **Experience** — add roles with dates, descriptions, gallery images
- **Stories** — create series, write episodes, assign them to series, control display order
- **Social Links** — manage all platform links shown on the About and Connect pages
- **Media** — view and manage all uploaded images and linked media
- **Analytics** — see which pages are being visited and how often
- **Messages** — read contact form submissions, mark as read

Everything is saved in real-time to a PostgreSQL database hosted on Supabase. No page refresh required. No deployment required. Changes appear on the live site immediately.

### AI Writing Assistance

Every text field in the dashboard has an AI enhance button. The owner can write a rough draft of a project description, click "Suggest Improvement," and receive a rewritten version that is more compelling, more professional, and formatted in Markdown — ready to publish.

This doesn't replace the owner's voice. It amplifies it. The AI is given strict instructions: keep the authentic voice, use the right formatting, return only the improved text.

Three separate AI functions cover different needs:
- **Content improvement** — rewrites full descriptions and stories
- **Preview text generation** — writes the 1-2 sentence hook that appears on cards
- **Title optimization** — makes titles more memorable and click-worthy

### Markdown Support

Content is stored and rendered as Markdown. This means the owner can use standard formatting conventions when writing — `**bold**`, `## headings`, `- bullet lists` — and the published page will render them correctly as styled text.

There is a live preview toggle in the dashboard. Write something, click "Preview markdown," and see exactly how it will look on the public page before saving.

---

## The Technical Foundation

The site is built for permanence, not just launch day.

**Next.js 16** with the App Router handles routing, server-side rendering, and API routes. Every public page fetches fresh data on each request — no stale caches, no "why isn't my content updating" moments.

**Supabase** provides the entire backend: PostgreSQL database, authentication, file storage, and row-level security. The owner's data is private by default. Visitors can only read what they're supposed to read. No one can write anything except the owner (and the contact form, which inserts a message but can read nothing).

**Framer Motion** powers every animation — the door opening, the orbit icons floating in, the gallery fading between images, the gift box exploding open. Animations are choreographed, not random.

**Vercel** hosts the site and auto-deploys every time the owner's developer pushes a code update to GitHub. Zero downtime. Zero manual steps.

**Google Drive compatibility** is built in. The owner can link images directly from Google Drive — the system automatically converts the sharing URL into a direct-display format. No separate image hosting account required.

---

## The Build Timeline

### Day 1 — The Full Foundation (March 26)

The entire site — landing page, orbit navigation, gift box, five public pages, authentication, onboarding wizard, dashboard, AI integration, and database schema — was built in a single session. Eight database tables. Fifteen-plus React components. Four API routes. Everything deployed to Vercel and live by the end of the day.

### Days 1-2 — Debugging What Broke (March 26-27)

After the initial build, several critical bugs appeared. Dashboard buttons had no effect. Profile images weren't showing. Public pages showed empty placeholders despite data being saved. Each bug had a specific technical cause that required reading the framework's documentation rather than guessing.

Images were invisible because Next.js requires external image hosting domains to be explicitly whitelisted — a single configuration line fixed every image across the entire site. Data wasn't loading because the database query syntax being used was incompatible with the database's structure — rewriting the queries unblocked every public page.

These are the kinds of bugs that separate a finished product from one that looks finished.

### Day 3 — Contact Form and Personal Story (March 28)

Added the ability for visitors to send contact messages directly through the site. Messages appear in the owner's dashboard with sender information, timestamp, and read/unread status. Added a personal story field — a place for the owner to write a deeper narrative beyond the standard bio. Added server-side caching fixes so pages always show the latest content.

### Day 4 — Full Mobile Support (March 29)

The site needed to work on a phone, not just a laptop. This required more than responsive CSS. The orbit navigation is fundamentally a hover interaction — it doesn't translate to touchscreens. A completely separate mobile landing layout was built: a grid of tappable section cards that navigates in a single tap. A persistent bottom navigation bar was added for mobile. Every tap target was sized to 44px minimum. iOS zoom on form fields was eliminated. The contact form was rebuilt for phone-first usability.

### Day 5 — Galleries, Series, and Episodes (March 29-30)

Projects and experience pages received image galleries — auto-rotating, with configurable speed and a full-screen lightbox. Stories became episodic: a series can now contain multiple labeled episodes, each with its own detail page and gallery. The dashboard was extended to support all of this with upload panels, link-paste panels, and media management grids.

### Day 6 — Markdown, Slug Fix, and Series Gallery (March 31)

Content across the entire site was upgraded to render Markdown. A bug that crashed episode creation when episodes shared similar titles was fixed permanently. The navigation bar was made sticky so readers never lose their navigation context. Portrait images were fixed so they display in full rather than being cropped to landscape containers. The series page received a two-column layout matching the episode detail pages.

---

## What Makes This Different

**It's a content platform, not just a digital resume.**
The episodic Stories feature means the owner can publish long-form writing over time. Each piece is deep-linkable, shareable, and part of a larger narrative arc.

**It remembers it's talking to humans.**
The gift box exists only to give something to the person visiting. That choice — to prioritize a visitor's emotional experience over a metric — shapes everything else about how the site feels.

**The owner can change everything without code.**
Every word, every image, every project, every experience entry is manageable through the dashboard. The site doesn't go stale because updating it requires a developer.

**It performs everywhere.**
Desktop browsers, mobile phones, slow connections, portrait images, landscape images, video, external links, Google Drive — all of it handled. The site works in the real world, not just in ideal conditions.

**It was built to last.**
Stable URLs mean every link shared on LinkedIn, in an email, or in a message will still work in two years. Content is stored as Markdown, which is readable without any special software. The database schema was designed for extension — adding new content types doesn't require rebuilding anything.

---

## For Anyone Building Something Similar

The most important decision made in this build was to treat the visitor's emotional experience as a first-class engineering requirement — not a nice-to-have, not a final polish step.

The door animation isn't decorative. It tells the visitor that what they're about to see was made carefully. The gift box isn't a gimmick. It shifts the visitor's relationship with the site from consumer to recipient.

Every technical decision that followed — the animation framework, the database structure, the Markdown rendering, the mobile layout — was in service of that experience being real, not just promised.

That's the difference between a portfolio and a presence.
