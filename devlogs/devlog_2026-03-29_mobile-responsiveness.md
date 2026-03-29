Dev Log — 2026-03-29

Project: AG Portfolio | Part: 6

---

Problem Noticed

The portfolio looked great on desktop but was completely broken on mobile. Navigating between pages was difficult — the top navigation bar crammed five links into a small space that overflowed the screen. The landing page used an orbit layout designed for mouse hover interactions, which made no sense on a touchscreen. The dashboard showed its tab bar beside the content area instead of above it. The contact form caused iOS to zoom in automatically when you tapped the email field. The gift box close button was too small to tap reliably. None of these were small oversights — together they made the site unusable on a phone.

---

Root Cause

Several separate issues, each with a clear fix:

**No mobile navigation:**
The top nav in `PageShell` used a horizontal `flex` row of five links. On a 375px screen, there's not enough room for five labels plus a Home link without overflow. There was also no persistent navigation — once you landed on a page, you had to scroll back up to the nav to go anywhere. Mobile users expect a bottom navigation bar.

**Landing page orbit layout:**
The orbit nav was built around hover interactions — icons revealed tooltips on `mouseEnter` and navigated on click. There was a `onTouchStart` handler that toggled the tooltip, but that meant users had to tap once to reveal the tooltip and then tap again to navigate. Two taps to get anywhere is too slow. On mobile the entire spatial concept (icons floating in a circle around a photo) also competes with the small screen.

**Dashboard layout:**
The outer wrapper used `flex` (defaulting to `flex-row`). On mobile, both the tab bar div and the main content div were placed side by side in one horizontal row. The tab bar had `w-full` but was constrained by flex context, causing the layout to collapse unpredictably depending on screen size.

**Contact form iOS zoom:**
iOS Safari automatically zooms in on any focused input with a font size below 16px. All three form inputs used `text-sm` (14px) — guaranteed to trigger zoom on every iOS device. The submit button was also left-aligned and not full-width, making it hard to tap on a narrow screen.

**Gift box close button:**
The close button was a raw `<X className="w-5 h-5">` icon with no padding — 20×20px, less than half the 44px minimum tap target Apple and Google both recommend. On a phone, you'd frequently miss it.

---

How It Was Fixed

**BottomNav component (new):**
Created `src/components/ui/BottomNav.tsx` — a mobile-only (`md:hidden`) persistent bottom bar with six icons: Home, Projects, Experience, About, Stories, Connect. Fixed to the viewport bottom at `z-50`. Uses `usePathname()` to highlight the active route. Includes `pb-safe` padding so the bar clears the iPhone home indicator on notched devices.

**MobileLandingGrid component (new):**
Created `src/components/landing/MobileLandingGrid.tsx` — a 2×3 grid of tappable section cards that replaces the orbit layout on mobile screens. Each card has a gradient icon, label, and short preview. Tapping navigates directly — one tap, no hover state. Cards animate in with a staggered spring entrance (same feel as the orbit icons on desktop). The fifth card spans two columns and centers itself so the grid looks intentional.

**PageShell updates:**
- Added `hidden md:flex` to the top-right nav links so they disappear on mobile
- Added `pb-20 md:pb-24` to the main content so it doesn't get hidden behind the bottom bar
- Added `<BottomNav />` at the end of the component

**Landing page dual layout:**
The `h-screen overflow-hidden` constraint was changed to `min-h-screen overflow-x-hidden` so mobile content can scroll. The center section now has two branches — `hidden md:block` for the desktop orbit layout (unchanged), and `flex md:hidden` for a stacked mobile layout: profile card at 70vw width above the section grid. The hint text switches from "Click any icon" to "Tap any section" on mobile.

**OrbitNav hidden on mobile:**
Wrapped the entire AnimatePresence return in a `hidden md:block` div. The orbit logic, animations, and tooltips are completely preserved — they just don't render on small screens.

**Dashboard flex fix:**
Changed `<div className="flex">` to `<div className="flex flex-col md:flex-row">`. On mobile, the tab bar now stacks vertically above the main content. The `<main>` element gets `w-full max-w-full md:max-w-3xl` so content fills the screen on mobile. Also updated the `CopyLink` button to try `navigator.share()` first on mobile (native share sheet), falling back to clipboard copy on browsers that don't support it.

**Contact form:**
- Added `inputMode="email"` and `autoComplete="email"` to the email field
- Changed all three inputs and the textarea from `text-sm` to `text-base` (16px prevents iOS zoom)
- Added `min-h-[44px]` to all inputs
- Made the submit button full-width on mobile with `w-full sm:w-auto justify-center min-h-[44px]`

**Gift box modal:**
- Wrapped the close button in `p-3` padding (icon 20px + 24px = 44px tap target)
- Added `max-h-[80vh] flex flex-col` to the modal so it never overflows the screen
- Wrapped the content in `overflow-y-auto flex-1` so long AI messages scroll inside the modal

**globals.css:**
- Added `overscroll-behavior: none` to prevent elastic bounce on iOS
- Added a `.pb-safe` utility class backed by `env(safe-area-inset-bottom)` for the BottomNav

---

Files Changed

- `src/components/ui/BottomNav.tsx` — new file
- `src/components/landing/MobileLandingGrid.tsx` — new file
- `src/components/ui/PageShell.tsx` — mobile nav hidden, bottom padding, BottomNav added
- `src/components/landing/OrbitNav.tsx` — hidden on mobile, desktop unchanged
- `src/app/page.tsx` — dual layout (orbit desktop / grid mobile), min-h-screen
- `src/components/sections/ContactForm.tsx` — inputMode, text-base, full-width button
- `src/components/gift/GiftBoxModal.tsx` — 44px close button, max-h modal, scrollable content
- `src/app/dashboard/page.tsx` — flex-col on mobile, full-width main, native share
- `src/app/globals.css` — overscroll-behavior, pb-safe utility

---

What I Learned

Mobile responsiveness is not just about grid breakpoints. There are at least four separate dimensions to get right: layout (how elements stack), interaction model (hover vs. tap), accessibility (tap target sizes, no iOS zoom), and performance (animations within memory budget). Each one can look fine on desktop and be completely broken on mobile.

The biggest mental shift was treating the mobile layout as its own first-class design — not just "smaller desktop." The landing page needed a fundamentally different interaction model on touch, not just smaller margins. Building the MobileLandingGrid as its own component (instead of forcing the orbit to work on touch) was the right call.
