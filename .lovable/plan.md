## Refactoring & Optimization Plan — NID Server Copy App

A phased plan to improve code quality, performance, accessibility, security and maintainability without changing the product scope (Bangladesh NID lookup with red/green theme + Hind Siliguri).

---

### Phase 1 — Project hygiene & structure

- Create a clear folder structure:
  ```text
  src/
    features/nid/
      components/   (NidForm, NidResult, InfoRow)
      hooks/        (useNidLookup)
      api/          (nidClient.ts)
      types.ts      (NidData, NidLookupRequest)
      schema.ts     (zod validators)
    components/ui/  (shadcn, unchanged)
    lib/            (utils, constants)
    pages/
  ```
- Move `NidData` out of `NidForm.tsx` into `features/nid/types.ts`.
- Remove unused shadcn components later (after audit) to shrink bundle.
- Add `.editorconfig` consistency check and ensure ESLint + Prettier run clean.

### Phase 2 — Type safety & validation

- Add `zod` schemas for the form payload and API response.
- Strengthen `tsconfig` for the app: enable `strict`, `noUnusedLocals`, `noUnusedParameters` in `tsconfig.app.json` (keep root permissive only if needed).
- Replace ad-hoc regex validation with a single `nidSchema` (NID 10/13/17 digits, DOB ≤ today, ≥ 1900).

### Phase 3 — Data layer & state

- Introduce a typed `nidClient.ts` using `fetch` with:
  - AbortController for cancellation
  - Timeout (e.g. 15s)
  - Centralized error mapping (network / 4xx / 5xx → Bangla messages)
- Use `@tanstack/react-query` (already installed) via a `useNidLookup` mutation:
  - Built-in loading / error / data states
  - Automatic request deduping and cancellation on unmount
- Move the API endpoint to `import.meta.env.VITE_NID_API_URL` with a safe fallback.

### Phase 4 — Form refactor

- Adopt `react-hook-form` + `zodResolver` for `NidForm`:
  - Field-level errors instead of one global error
  - Better a11y (aria-invalid per field, aria-describedby)
  - Cleaner controlled inputs
- Extract reusable `<FormField>` wrapper around shadcn `Input`/`Label`.
- Debounce NID input sanitization and cap length consistently.

### Phase 5 — UI/UX polish

- Replace raw `<input>` elements with shadcn `Input` + `Label` for visual + a11y consistency.
- Add skeleton state for `NidResult` while loading.
- Add `aria-live="polite"` region for result and error.
- Use `next-themes`-style dark mode toggle (project already has `.dark` tokens).
- Add subtle motion only with `prefers-reduced-motion` respected.

### Phase 6 — Accessibility (WCAG AA)

- Verify contrast on `--muted-foreground` over `--background` and `--primary` over `--primary-foreground`.
- Ensure all interactive elements have visible focus rings (already added on button — extend to inputs).
- Add `lang="bn"` on `<html>` (and `lang="en"` only on English-only nodes).
- Add `<title>`, meta description, OG tags, canonical, JSON-LD `WebSite` in `index.html`.

### Phase 7 — Performance

- Code-split the result component: `const NidResult = lazy(() => import('./NidResult'))`.
- Preload `Hind Siliguri` with `<link rel="preconnect">` + `display=swap` (already swap).
- Self-host the font subset (Bangla + Latin) to cut FOIT and remove Google Fonts request.
- Audit `lucide-react` usage; import icons individually (already done) — ensure no full-package import sneaks in.
- Image optimization: lazy-load NID photo with `loading="lazy"` and `decoding="async"`.
- Enable Vite `build.target: 'es2020'` and `cssCodeSplit` (defaults OK; verify).

### Phase 8 — SEO

- `<title>` ≤ 60 chars, meta description ≤ 160 chars (Bangla + English keywords).
- Single H1 (Index page hero).
- Add `robots.txt` rules and `sitemap.xml`.
- JSON-LD `GovernmentService` / `WebApplication` schema.

### Phase 9 — Security & privacy

- Never log NID number / DOB to console or analytics.
- Set `Referrer-Policy: no-referrer` and CSP meta in `index.html`.
- Sanitize all API response strings before rendering (defense in depth, even though React escapes).
- Plan migration to Lovable Cloud edge function so the real Porichoy API key is never exposed in the browser.

### Phase 10 — Testing

- Unit tests (vitest, already set up):
  - `nidSchema` valid/invalid cases
  - `nidClient` error mapping (mock fetch)
  - `NidForm` renders errors, submits payload
- One Playwright happy-path test: fill form → mocked success → result visible.

### Phase 11 — Tooling & DX

- Add `bun run typecheck` and wire into CI.
- Pre-commit hook (lint-staged) for ESLint + Prettier on staged files.
- Add `README.md` section: env vars, dev, test, deploy.

### Phase 12 — Backend readiness (when API keys arrive)

- Enable Lovable Cloud.
- Edge function `nid-lookup` that:
  - Validates body with zod
  - Calls Porichoy with stored secret
  - Returns normalized `NidData`
- Add rate-limiting (per IP) and audit log table (no PII, only request hash + timestamp).

---

### Execution order (suggested PRs)

1. Phase 1 + 2 (structure + types) — low risk, foundation.
2. Phase 3 + 4 (data layer + form) — biggest quality win.
3. Phase 5 + 6 (UI/a11y polish).
4. Phase 7 + 8 (perf + SEO).
5. Phase 9 + 12 (security + backend) — once API creds available.
6. Phase 10 + 11 (tests + tooling) — continuous.

Each phase is independently shippable and reversible.
