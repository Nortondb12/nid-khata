## Goal
Complete the responsive layout pass for the NID form so it looks great on mobile, tablet, and desktop.

## Changes

1. **`src/features/nid/components/NidForm.tsx`** (already partly done)
   - Wrapper widened smoothly: `max-w-md` on mobile → `max-w-lg` from `sm:` up.
   - Card padding scales: `p-5 sm:p-7 lg:p-8`, radius `rounded-2xl sm:rounded-3xl`.
   - Header icon + title sizes tightened on mobile (`w-10 h-10` → `sm:w-11 sm:h-11`).
   - Inputs stay `h-12` with `text-base` (prevents iOS zoom); label row keeps counter aligned on all widths.

2. **`src/pages/Index.tsx`** (hero + form grid)
   - Change hero grid to `md:grid-cols-2` (currently `lg:`) so tablet gets side-by-side instead of a tall stacked column.
   - Form column: `justify-center md:justify-end` and `w-full` so it fills tablet width and right-aligns on desktop.
   - Reduce hero vertical padding on mobile (`pt-8 sm:pt-12 lg:pt-16`) to keep the form above the fold.
   - Trust badges wrap cleanly on narrow widths (already OK, verify).

3. **Verification**
   - Screenshot at 375px (mobile), 768px (tablet), 1280px (desktop) with Playwright and confirm no overflow, comfortable spacing, and the form stays fully visible.

No functional or business-logic changes — presentation only.