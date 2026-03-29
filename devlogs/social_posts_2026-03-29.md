Social Posts — 2026-03-29 | AG Portfolio Part 6

---

LinkedIn

My portfolio looked polished on desktop. On mobile it was a different story.

Five navigation links crammed into a 375px screen. An orbit navigation that required hovering — on a touchscreen. A contact form that zoomed the entire page every time someone tapped the email field on iOS. A gift box close button so small you'd miss it three times before hitting it.

None of it was subtle. It was just broken.

Here's what I fixed this session:

**Bottom navigation bar**
Mobile users expect to navigate from the bottom of the screen, not scroll back to the top. Built a persistent bottom nav bar with six icons that follows you across every public page. It highlights the active route and respects the iPhone home indicator so nothing gets cut off.

**Landing page — two layouts, not one**
The orbit nav (icons floating around a photo card) works great on desktop with a mouse. On touch, you had to tap to reveal a tooltip and tap again to navigate. Two taps is too slow. On mobile, the orbit is replaced entirely with a 2×3 grid of tappable cards — one tap goes straight to the section. Desktop keeps the orbit, animations and all.

**iOS zoom fix**
Any input below 16px font size triggers automatic zoom on iOS Safari. My form had `text-sm` (14px) on every field. Changed every input to `text-base` and added `inputMode="email"` to the email field so iOS shows the right keyboard.

**Tap targets**
The gift box close button was 20×20px. Apple recommends 44×44px minimum. Added padding, fixed.

**Dashboard layout**
The tab bar was sitting beside the content instead of above it. One class change — `flex` to `flex-col md:flex-row` — fixed the whole layout.

The code wasn't the hard part. The hard part was realizing that "mobile responsive" means designing a different experience for touch, not just scaling down the desktop one.

Part 7 coming.

#buildinpublic #nextjs #webdev #mobiledesign #ux #softwaredevelopment

---

Facebook

Part 6 of my portfolio build — I made the whole site actually work on mobile.

It looked great on desktop. On a phone it had five nav links overflowing the screen, a hover-based landing page that made no sense on touchscreen, and a contact form that zoomed in on iOS every time you tapped a field.

The biggest change: the landing page now has two completely separate layouts. Desktop keeps the orbit navigation (icons floating around the profile photo — looks cinematic on a big screen). Mobile gets a simple grid of tap-friendly cards that take you straight to each section in one tap.

Also added a persistent bottom navigation bar, fixed tap target sizes throughout, and resolved the iOS zoom bug on the contact form.

What's been your biggest "looks fine on desktop, broken on mobile" moment? Drop it below 👇

#buildinpublic #webdev #javascript

---

Instagram

Part 6 — making my portfolio actually work on a phone.

On desktop: clean orbit nav, elegant animations, everything centered perfectly.

On mobile: five links overflowing the header, a hover-based landing page on a touchscreen, a contact form zooming in on iOS every time you tap, and a close button too small to hit.

What I built this session:
→ Bottom nav bar — persistent, 6 icons, active state, iPhone safe area
→ Mobile landing grid — 2×3 tappable cards replacing the orbit on small screens
→ iOS zoom fix — text-base on all inputs + inputMode="email"
→ 44px tap targets on the gift box close button
→ Dashboard layout fixed — tabs now stack above content on mobile

Desktop layout? Completely unchanged.

The lesson: mobile isn't just "smaller desktop." Touch devices need a different interaction model — not the same design squeezed into fewer pixels.

Part 7 next.

#buildinpublic #nextjs #mobiledesign #webdevelopment #portfoliobuilder #devlog #ux #100daysofcode #typescript #javascript
