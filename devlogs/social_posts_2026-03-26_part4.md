Social Posts — 2026-03-26 | AG Portfolio Part 4

---

LinkedIn

Part 4 of building my personal portfolio — and this session was a masterclass in silent failures.

Every single write operation in my dashboard was broken. Save Profile. Add Project. Upload Photo. Sign Out. All of them. And not one error message in sight. Just buttons that looked like they worked and did absolutely nothing.

Here's what was actually happening:

The Supabase database tables hadn't been created yet. When the app tried to load the owner profile on startup and got back null, every save function had `if (!owner) return` at the top — so they all exited silently. No errors, no toast, no feedback. The buttons just... didn't do anything.

Then I found the onboarding was hanging forever on "Setting up..." because one code path called `setLoading(true)` and never called `setLoading(false)` when an error occurred. Zero try/catch.

Three lessons this session:

1. **Silent failures are the worst bugs to debug** — always add error feedback at every async operation, not just at the end.
2. **CSS stacking contexts trap z-index** — a tooltip with z-index: 9999 inside a parent at z-index: 20 will still sit below an element at z-index: 25. Fix the parent, not the child.
3. **`supabase.upsert()` needs `onConflict`** if you're matching on a unique non-primary-key column.

The site is live at ag-portfolio-beta.vercel.app. Once the Supabase schema is set up, the full dashboard will work. Getting there step by step.

#buildinpublic #nextjs #supabase #webdev #portfolio

---

Facebook

Every developer has that moment where you click a button, nothing happens, and you have no idea why. 😅

That was me this session. Save button: broken. Upload photo: broken. Sign out: broken. No errors, no messages — just silence.

Turned out the database tables weren't created yet, so every button was hitting a null check and giving up without saying a word. Fixed it by adding real error messages and a warning banner that actually tells you what to do next.

Also fixed some visual bugs — icons were getting cut off on mobile and tooltips were hiding behind the profile photo. Small things that make a huge difference when someone opens it on their phone.

Progress is progress. 💪

#portfolio #buildinpublic

---

Instagram

Part 4 — everything was broken and I had NO idea why 😅

Save button? Silent. Upload photo? Nothing. Sign out? Didn't move.

Turned out: no database tables = all buttons return early with zero feedback. Classic.

Fixed it. Added error messages. Fixed mobile icon clipping. Fixed tooltip z-index (CSS stacking contexts are sneaky). Centered the welcome text.

Live at ag-portfolio-beta.vercel.app 🚀

Save this if you're building with Next.js + Supabase — the `onConflict` gotcha in upsert will catch you off guard.

#buildinpublic #nextjs #supabase #portfolio #webdevelopment #javascript #react #coding
