Dev Log — 2026-03-26

Project: AG Personal Portfolio | Part: 1

Problem Noticed
The owner had a clear vision for an extraordinary personal portfolio — not a static resume, but a cinematic interactive experience. Recruiters, friends, and family should feel welcomed and captivated from the first second. No code existed yet — just a spec file (My Profile.json) and a professional photo.

Root Cause
Standard portfolio tools (Wix, Squarespace, Framer templates) can't deliver the specific experience: door-opening animation, orbit navigation, AI gift box, owner dashboard with AI content optimization, and deep-linkable section pages for LinkedIn sharing.

How It Was Fixed
Built a full-stack Next.js 16 portfolio from scratch in a single session:

1. Scaffolded the project with TypeScript, Tailwind CSS, and App Router
2. Installed Framer Motion, Supabase JS SDK, and Anthropic SDK
3. Designed and built a cinematic landing page:
   - Two-panel door animation that opens to reveal the portfolio
   - Full-screen profile image with ambient glow
   - 5 orbit icons floating around the photo (Projects, Experience, About, Stories, Connect)
   - Each icon has a hover preview tooltip
4. Built the gift box feature:
   - Persistent glowing gift icon on every page (bottom-right)
   - Animated modal: box lid flies open, confetti particles, owner photo reveals, AI-generated encouraging message appears
   - Every click generates a fresh message via Claude Haiku
5. Built 4 public section pages with stable deep-link URLs (/projects, /experience, /about, /stories)
6. Built owner auth: /login with Supabase Auth, route protection via proxy.ts
7. Built 5-step onboarding wizard (photo upload, profile info, first project, social link)
8. Built full owner dashboard with tabs for profile, projects, experience, stories, and analytics
9. Added AI "Suggest Improvement" button to every text field in the dashboard
10. Set up Supabase schema with 8 tables and RLS policies
11. Pushed to GitHub: https://github.com/ayubagarba10/ag-portfolio

Files Changed
- portfolio/src/app/page.tsx — Landing page
- portfolio/src/app/layout.tsx — Root layout with GiftBox
- portfolio/src/app/projects/page.tsx
- portfolio/src/app/experience/page.tsx
- portfolio/src/app/about/page.tsx
- portfolio/src/app/stories/page.tsx
- portfolio/src/app/login/page.tsx
- portfolio/src/app/onboarding/page.tsx
- portfolio/src/app/dashboard/page.tsx
- portfolio/src/app/api/gift-message/route.ts
- portfolio/src/app/api/ai-suggest/route.ts
- portfolio/src/app/api/analytics/route.ts
- portfolio/src/proxy.ts — Route protection (Next.js 16 renamed middleware → proxy)
- portfolio/src/components/landing/WelcomeAnimation.tsx
- portfolio/src/components/landing/CinematicHero.tsx
- portfolio/src/components/landing/OrbitNav.tsx
- portfolio/src/components/gift/GiftBoxIcon.tsx
- portfolio/src/components/gift/GiftBoxModal.tsx
- portfolio/src/components/gift/GiftBoxWrapper.tsx
- portfolio/src/components/sections/ProjectCard.tsx
- portfolio/src/components/sections/ExperienceTimeline.tsx
- portfolio/src/components/sections/StoryPost.tsx
- portfolio/src/components/ui/PageShell.tsx
- portfolio/src/lib/supabase/client.ts
- portfolio/src/lib/supabase/server.ts
- portfolio/src/lib/anthropic.ts
- portfolio/src/lib/utils.ts
- portfolio/supabase/schema.sql
- portfolio/.env.local

What I Learned
Building experience-first means designing for the visitor's emotions before functionality — the door animation and gift box aren't features, they're the feeling. Next.js 16 silently renamed `middleware.ts` to `proxy.ts` — always read the framework docs before writing route protection code.
