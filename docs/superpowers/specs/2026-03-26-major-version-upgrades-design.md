# Major Version Upgrades Design

**Date:** 2026-03-26
**Project:** deck-select-1 (Magic: The Gathering Commander lobby app)
**Stack:** Svelte 5 (runes), SvelteKit 2, Tailwind CSS 3, shadcn-svelte, Supabase, Vercel

## Overview

Upgrade all dependencies with major version gaps to their latest stable releases. The project is already on Svelte 5 with full rune adoption, so the framework core is modern — the upgrades target tooling, the design system, the component library, and supporting utilities.

## Strategy

Each wave is committed separately for clean rollback points. Within each wave:
1. Consult official migration guides (via context7) before touching code
2. Run `npm run build` to validate after each wave
3. Fix all TypeScript/lint errors before moving on
4. No application logic changes — purely dependency upgrades and mechanical code adjustments

---

## Wave 1 — Tooling

**Packages:** `typescript` v5→v6, `eslint` v9→v10, `@eslint/compat` v1→v2, `@eslint/js` v9→v10, `eslint-plugin-svelte` v2→v3, `globals` v15→v17, `vite` v6→v8, `vitest` v3→v4

**Changes:**
- **TypeScript v6** — strict mode adjustments; `tsconfig.json` uses `moduleResolution: bundler` which should remain compatible
- **ESLint v10** — already on flat config format (`eslint.config.js`) from ESLint v9; migration is largely mechanical plugin/rule name updates
- **vite v8** — `vite.config.ts` currently imports from `vitest/config`; verify the vite/vitest config split is still valid
- **vitest v4** — minimal test setup reduces risk; check for config option renames

**Validation:** `npm run build`, `npm run check`, `npm run lint`

---

## Wave 2 — Tailwind v4

**Packages:** `tailwindcss` v3→v4, `tailwindcss-animate` (verify v4 compat), `prettier-plugin-tailwindcss` v0.6→v0.7, `tailwind-variants` v0.3→v3, `tailwind-merge` (already updated)

**Changes:**
- Run `npx @tailwindcss/upgrade` codemigrator as the primary migration tool
- **`tailwind.config.ts` → deleted** — config moves to `src/app.css` as a `@theme {}` block
- **`postcss.config.js`** — changes from `{ tailwindcss, autoprefixer }` to `{ "@tailwindcss/postcss": {} }`
- **`src/app.css`** — `@tailwind base/components/utilities` → `@import "tailwindcss"`; dark mode variant inline as `@variant dark (&:is(.dark *))`
- **Custom theme** — Discord colors, sidebar colors, `--radius`, and animations migrate to `@theme {}` blocks; `hsl(var(--x))` references simplify to `var(--x)` since v4 handles color space automatically
- **`tailwind-variants` v3** — `tv()` used in `button.svelte` and potentially other components; check v3 variant group syntax changes
- Manually verify `src/app.css` after codemigrator and fix any missed class names

**Validation:** `npm run build`, visual spot-check of component styles

---

## Wave 3 — Component Library

**Packages:** `bits-ui` v1→v2, `paneforge` v1.0.0-next.x→v1.0.2 (stable), `embla-carousel-svelte` (already updated)

**Changes:**
- bits-ui v2 is a significant rewrite of primitive APIs; all 44 shadcn-svelte component categories in `src/lib/components/ui/` need updating
- **Preferred approach:** Use `npx shadcn-svelte@latest add <component>` to regenerate each component against the new API. Diff before/after for each to reapply any custom modifications.
- **Fallback:** Manually patch import/API changes per the bits-ui v2 migration guide if CLI regeneration is not available or causes regressions
- **Import changes** — `import { X as XPrimitive } from "bits-ui"` patterns may need updating for reorganised exports
- **Type exports** — `WithElementRef`, `WithoutChild` utility types location may have changed
- **`vaul-svelte`** — currently `1.0.0-next.6`; npm "latest" shows `0.3.2` (stable track diverged from pre-release). Investigate repo to determine correct path before upgrading.
- **`paneforge`** — move from pre-release `1.0.0-next.x` to stable `1.0.2`

**Validation:** `npm run build`, `npm run check`, visual review of all component types in the app

---

## Wave 4 — UI Utilities

**Packages:** `mode-watcher` v0→v1, `svelte-sonner` v0→v1, `lucide-svelte` v0→v1, `zod` v3→v4, `@supabase/ssr` v0.5→v0.9, `@supabase/supabase-js` v2.49→v2.100

**Changes:**
- **`mode-watcher` v1** — usage is isolated to `src/lib/components/ui/sonner/sonner.svelte` (`import { mode } from "mode-watcher"`, `$mode`). Update to v1 store/rune pattern.
- **`svelte-sonner` v1** — `src/lib/components/ui/sonner/sonner.svelte` wraps the Toaster; update props and theme integration for v1 API
- **`lucide-svelte` v1** — individual icon imports (`lucide-svelte/icons/<name>`) pattern should persist; verify the icons in use (ChevronDown, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, Check, Minus, Circle, Search, X, Ellipsis, Plus) against the v1 rename list
- **`zod` v4** — minimal current usage (no schemas written yet); likely a package bump with no code changes
- **Supabase** — check `hooks.server.ts` and Supabase client setup against `@supabase/ssr` v0.9 changelog for deprecated SSR patterns; `safeGetSession` pattern and cookie handling are the most likely areas to check

**Validation:** `npm run build`, test auth flow and toast notifications

---

## Wave 5 — Adapters

**Packages:** `@sveltejs/adapter-auto` v4→v7, `@sveltejs/vite-plugin-svelte` v5→v7

**Note:** If `@sveltejs/vite-plugin-svelte` v7 has a hard requirement on Vite v8, it may need to move to Wave 1. Check the compatibility matrix before starting.

**Changes:**
- **`@sveltejs/adapter-auto` v7** — `svelte.config.js` imports `adapter` from this package; verify Vercel auto-detection still works and `vercel.json` remains valid
- **`@sveltejs/vite-plugin-svelte` v7** — `svelte.config.js` imports `vitePreprocess` from here; check for preprocess API changes across the two major version jumps (v5→v7)

**Validation:** `npm run build`, `npm run check`, full end-to-end local dev check (`npm run dev`)

---

## Files Primarily Affected

| File | Waves |
|------|-------|
| `tailwind.config.ts` | 2 (deleted) |
| `postcss.config.js` | 2 |
| `src/app.css` | 2 |
| `src/lib/components/ui/**` | 3 (all 44 component categories) |
| `src/lib/components/ui/sonner/sonner.svelte` | 3, 4 |
| `svelte.config.js` | 5 |
| `vite.config.ts` | 1 |
| `eslint.config.js` | 1 |
| `tsconfig.json` | 1 |
| `src/hooks.server.ts` | 4 |
| `package.json` | all |

## Out of Scope

- Application logic changes
- New features
- Route or database schema changes
- `@scryfall/api-types` (already on wanted version, no major bump)
- `date-fns`, `tippy.js` (no major bumps available)
