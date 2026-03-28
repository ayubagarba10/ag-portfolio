Dev Log — 2026-03-26

Project: AG Portfolio | Part: 4

---

Problem Noticed

After completing the portfolio build, the owner tried to use the dashboard and discovered that nothing worked:
- Save Profile button had no effect
- Add Project / Experience / Story buttons did nothing
- Onboarding wizard got stuck on "Setting up..." forever
- Uploading/replacing profile photo in dashboard silently failed
- Sign Out button did not respond or navigate away
- On mobile: Projects and About orbit icons were clipped at the screen edges
- Stories and Connect tooltips were cut off (text appeared behind the profile card)
- The name/Welcome text inside the profile card was left-aligned instead of centered

---

Root Cause

Six separate root causes, all discovered by reading the source files:

1. **Silent save failures**: All dashboard save buttons checked `if (!owner) return` at the top. The `owner` state was null because `loadAll()` failed — the Supabase database tables didn't exist yet (schema.sql not run). Since errors were swallowed silently, buttons appeared unresponsive.

2. **Onboarding infinite hang**: `handleFinish()` called `setLoading(true)` but had a code path `if (!user) return` that never called `setLoading(false)`. Also, any unhandled exception left loading=true forever. No try/catch existed around the async operations.

3. **Sign-out not navigating**: `supabase.auth.signOut()` + `router.push('/')` works for client-side state, but doesn't force a full reload to clear Supabase SSR session cookies. The user stayed "logged in" at the SSR layer.

4. **Orbit z-index bug**: The orbit container had `z-[20]` and the profile card wrapper had `z-[25]`. In CSS, a parent with `position` + `z-index` creates an isolated stacking context. So tooltips inside the orbit container (even at z=30) could never appear above the card at z=25 — they were always confined to the orbit's stacking context at z=20.

5. **Mobile orbit icon clipping**: Orbit radius was 190px and the card was centered at 187.5px from the left edge of a 375px screen. Projects icon (at -180.7px from center) had its left edge at -15px — 15px off-screen. Same for About on the right.

6. **Tooltip overflow**: Stories and Connect tooltip (`w-48 = 192px`) centered on icons at ±111.7px from screen center overflowed the viewport by ~20px on each side.

---

How It Was Fixed

1. **Save operations**: Wrapped all DB operations in try/catch with finally blocks. Added `showError()` helper for consistent error toasts. Added a yellow warning banner at the top of the dashboard when `owner` is null (prompts user to run schema.sql).

2. **Onboarding**: Added full try/catch around `handleFinish()`. Added `setLoading(false)` in all exit paths including the `if (!user)` early return. Added visible error message in the UI. Added `onConflict: 'user_id'` to the upsert so re-running onboarding safely updates the existing profile.

3. **Sign-out**: Replaced `router.push('/')` with `window.location.href = '/'` to force a full page reload, which clears all SSR session cookies. Wrapped in try/catch so errors don't prevent navigation.

4. **Orbit z-index**: Swapped the DOM order — card is now rendered FIRST (z-[20]), orbit SECOND (z-[30]). Orbit icons don't visually overlap the card (radius is large enough), so raising the orbit layer has no negative visual effect. Tooltips now correctly float above the card.

5. **Mobile clipping**: Added a new `xs` breakpoint for screens under 640px. Card shrinks to 160×200px (half-diagonal ≈ 128px). OrbitNav now detects three screen sizes (xs/sm/lg) and uses radius 150/190/240 respectively. On 375px: orbit icon at 150×cos(18°) ≈ 142.6px from center → 187.5-142.6 = 44.9px from left edge ✓

6. **Tooltip overflow**: Changed tooltip width to `w-36 md:w-44`. Added positional logic: if icon x > 50 (right side, like Stories), tooltip right-aligns; if x < -50 (left side, like Connect), tooltip left-aligns; otherwise centers. Caret also repositions accordingly.

---

Files Changed

- `src/app/page.tsx` — Orbit z-[30], card z-[20], card size xs breakpoint
- `src/components/landing/OrbitNav.tsx` — Dynamic radius xs/sm/lg, smart tooltip alignment
- `src/components/landing/CinematicHero.tsx` — text-center on name/headline
- `src/app/dashboard/page.tsx` — try/catch on all ops, error toast, schema banner, window.location sign-out
- `src/app/onboarding/page.tsx` — try/catch throughout, onConflict upsert, error UI

---

What I Learned

When a parent has `position` + `z-index`, it creates a CSS stacking context that confines all child z-indices — so setting `z-index: 9999` on a child doesn't help if the parent stacking context sits below another element. The fix is always at the stacking context level, not the child level.

Supabase upsert without `onConflict` uses the primary key — if you're upserting by a unique non-PK column (like `user_id`), you must specify `{ onConflict: 'user_id' }` or it will create duplicate rows or fail silently.
