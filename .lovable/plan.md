## Refactoring & Optimization Plan — NID Server Copy App

Goal: improve code quality, performance, accessibility, security, SEO and maintainability without changing product scope (Bangladesh NID lookup, red/green theme, Hind Siliguri typography). Phases 1–5 are already implemented; this plan continues from Phase 6 and adds concrete steps.

---

### Current status (already shipped)

- `src/features/nid/` structure with `types.ts`, `schema.ts` (zod), `api/nidClient.ts` (AbortController + timeout + error mapping), `hooks/useNidLookup.ts` (react-query mutation), and `components/` (`NidForm`, `NidResult`, `InfoRow`).
- `react-hook-form` + `zodResolver` with per-field errors and aria attributes.
- shadcn `Input`/`Label`, skeleton loading state, `aria-live` region, `motion-reduce` support.
- Lazy-loaded `NidResult` via `React.lazy` + `Suspense`.

---

### Phase 6 — Accessibility (WCAG AA)

- Set `lang="bn"` on `<html>` in `index.html`; add `lang="en"` on English-only spans (e.g. name_en).
- Audit contrast for `--muted-foreground` on `--background` and `--primary` on `--primary-foreground` in both light/dark; adjust HSL tokens in `src/index.css` if below 4.5:1.
- Add visible focus rings to all `Input`s (extend the button pattern) using `focus-visible:ring-2 ring-primary/40`.
- Make the hero icon container a real heading-adjacent decoration (already `aria-hidden`); add a "skip to form" link for keyboard users.
- Verify with `axe-core` (dev-only) in a Playwright test.

### Phase 7 — Performance

- Self-host `Hind Siliguri` (Bangla + Latin subsets) under `src/assets/fonts/`; drop Google Fonts `<link>` and use `@font-face` with `font-display: swap` to eliminate the extra request and FOIT.
- Preload the photo with `loading="lazy" decoding="async"` (already partial — verify in `NidResult`).
- Add `<link rel="preconnect">` for the NID API origin.
- Verify Vite settings: `build.target: 'es2020'`, `cssCodeSplit: true` (defaults), enable `build.sourcemap: false` for prod.
- Audit `lucide-react` imports — confirm tree-shaken named imports only.
- Add `react-query` defaults: `staleTime: 0`, `retry: 1`, `refetchOnWindowFocus: false` for the lookup mutation.

### Phase 8 — SEO

- `index.html`: `<title>` ≤60 chars, meta description ≤160 chars (Bangla + key English terms), canonical, OG + Twitter tags, theme-color.
- Add JSON-LD `WebApplication` / `GovernmentService` schema with name, description, inLanguage `bn-BD`.
- `public/robots.txt`: allow all, point to `sitemap.xml`.
- `public/sitemap.xml`: single URL entry for `/`.
- Confirm single H1 on `/` (already true).

### Phase 9 — Security & privacy

- Add a console-safe logger that strips NID/DOB before any logging; forbid raw `console.log(values)` via ESLint rule.
- Add CSP and `Referrer-Policy: no-referrer` `<meta>` in `index.html`.
- Sanitize all API response strings on render boundary (defense in depth) via a small `safeText()` util.
- Document migration path to Lovable Cloud edge function so the Porichoy key never ships to the browser (Phase 12).

### Phase 10 — Testing

- Vitest unit tests:
  - `schema.test.ts` — valid NID (10/13/17), invalid lengths, invalid DOB, future DOB.
  - `nidClient.test.ts` — mock `fetch` for 400/404/429/500/timeout → correct Bangla messages.
  - `NidForm.test.tsx` — renders field errors, submits payload, shows skeleton, renders result.
- Playwright happy-path: fill form → mock success via route interception → assert result card + download button.

### Phase 11 — Tooling & DX

- Tighten `tsconfig.app.json`: enable `strict`, `noUnusedLocals`, `noUnusedParameters`; fix resulting errors.
- Add `bun run typecheck` script and `lint-staged` pre-commit (ESLint + Prettier on staged files).
- README section: env vars (`VITE_NID_API_URL`), dev, test, deploy.

### Phase 12 — Backend readiness (when Porichoy creds arrive)

- Enable Lovable Cloud.
- Edge function `nid-lookup`:
  - Validates body with the same zod schema (shared via `src/features/nid/schema.ts`).
  - Calls Porichoy with secret from Cloud env.
  - Returns normalized `NidData`.
- Rate-limit per IP (e.g. 10/min) and write an audit log row (request hash + timestamp, never PII).
- Swap `API_ENDPOINT` in `nidClient.ts` to the edge function URL.

---

### Suggested execution order

1. Phase 6 + 8 — a11y + SEO (low risk, user-visible win).
2. Phase 7 — performance (font self-host is the biggest single gain).
3. Phase 9 — security hardening.
4. Phase 11 — strict TS + tooling (may surface small fixes).
5. Phase 10 — tests, locked in after the above stabilize.
6. Phase 12 — backend, once API credentials are available.

Each phase is independently shippable and reversible.
