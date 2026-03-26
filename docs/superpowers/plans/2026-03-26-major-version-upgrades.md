# Major Version Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all dependencies with major version gaps to their latest stable releases across five sequential waves, with a validated build after each wave.

**Architecture:** Sequential waves (Tooling → Tailwind → Component Library → UI Utilities → Adapters). Each wave commits separately for clean rollback points. No application logic changes — only dependency upgrades and the mechanical code adjustments they require.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), TypeScript, Tailwind CSS, shadcn-svelte components, bits-ui, Supabase, Vercel

---

## Pre-flight

### Task 0: Check @sveltejs/vite-plugin-svelte v7 peer dependency

**Files:** none

- [ ] **Step 1: Check peer dependency requirements**

```bash
npm show @sveltejs/vite-plugin-svelte@7 peerDependencies
```

Expected output: shows the vite version required (e.g., `"vite": "^8.0.0"`).

- [ ] **Step 2: Decide Wave placement**

If output shows `vite: "^8.0.0"` or higher: `@sveltejs/vite-plugin-svelte@^7` **must** be added to the Wave 1 install command in Task 1, Step 1.

If output shows `vite: "^6.0.0"` (compatible with current): leave it in Wave 5 as planned.

---

## Wave 1 — Tooling

**Packages:** `typescript` v5→v6, `eslint` v9→v10, `@eslint/compat` v1→v2, `@eslint/js` v9→v10, `eslint-plugin-svelte` v2→v3, `globals` v15→v17, `vite` v6→v8, `vitest` v3→v4

### Task 1: Install Wave 1 packages and fix TypeScript v6 + ESLint v10

**Files:**
- Modify: `package.json`, `tsconfig.json`, `eslint.config.js`

- [ ] **Step 1: Install tooling upgrades**

```bash
npm install -D typescript@^6 eslint@^10 "@eslint/compat@^2" "@eslint/js@^10" "eslint-plugin-svelte@^3" "globals@^17"
```

If Task 0 determined `@sveltejs/vite-plugin-svelte@^7` requires Vite 8, add it here:
```bash
npm install -D "@sveltejs/vite-plugin-svelte@^7"
```

- [ ] **Step 2: Fetch TypeScript v6 migration guide**

Use context7:
1. Resolve library ID: `typescript`
2. Query docs with topic: `TypeScript 6 migration breaking changes erasableSyntaxOnly enums`

Note any breaking changes that affect `.svelte` files and `.ts` files in `src/`.

- [ ] **Step 3: Run svelte-check to surface TypeScript v6 errors**

```bash
npm run check 2>&1 | head -100
```

Fix any errors surfaced. The most likely TypeScript v6 breaking change affecting this codebase: enum syntax may require `--erasableSyntaxOnly` or types may have stricter null behaviour. The `tsconfig.json` is minimal (`moduleResolution: "bundler"`, `strict: true`) and should largely be fine.

- [ ] **Step 4: Fetch ESLint v10 + eslint-plugin-svelte v3 migration guides**

Use context7:
1. Resolve library ID: `eslint`, query: `ESLint v10 migration guide flat config breaking changes`
2. Resolve library ID: `eslint-plugin-svelte`, query: `eslint-plugin-svelte v3 migration breaking changes flat config exports`

- [ ] **Step 5: Update eslint.config.js for ESLint v10 + plugin-svelte v3**

Current `eslint.config.js`:
```js
import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node }
        }
    },
    {
        files: ['**/*.svelte'],
        languageOptions: { parserOptions: { parser: ts.parser } }
    }
);
```

Apply changes per migration guides from Step 4. The key area to check: `svelte.configs['flat/recommended']` and `svelte.configs['flat/prettier']` may have been renamed in v3. `@eslint/compat@2` `includeIgnoreFile` should still work but verify its import path.

- [ ] **Step 6: Run lint to verify**

```bash
npm run lint 2>&1 | head -60
```

Fix any errors before proceeding.

---

### Task 2: Fix vite.config.ts for Vite v8 and Vitest v4

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Install Vite v8 and Vitest v4**

```bash
npm install -D "vite@^8" "vitest@^4"
```

- [ ] **Step 2: Fetch Vite v8 migration guide**

Use context7: resolve library ID `vite`, query: `Vite 8 migration guide breaking changes config API`

- [ ] **Step 3: Fetch Vitest v4 migration guide**

Use context7: resolve library ID `vitest`, query: `Vitest 4 migration guide breaking changes config defineConfig`

- [ ] **Step 4: Update vite.config.ts**

Current file:
```ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
```

Apply changes per migration guides. The main risk: in Vitest v4, `defineConfig` from `vitest/config` may have been moved or the `test` config shape changed. Update accordingly.

---

### Task 3: Validate and commit Wave 1

**Files:** all Wave 1 modified files

- [ ] **Step 1: Build**

```bash
npm run build 2>&1
```

Expected: build succeeds. The existing `CRON_SECRET` error (`"CRON_SECRET" is not exported by " virtual:env/static/private"`) is pre-existing and acceptable — it only occurs in local builds without the env var set.

- [ ] **Step 2: Type-check**

```bash
npm run check 2>&1
```

Expected: 0 errors (or same pre-existing errors as before this wave)

- [ ] **Step 3: Lint**

```bash
npm run lint 2>&1
```

Expected: no errors

- [ ] **Step 4: Commit Wave 1**

```bash
git add package.json package-lock.json tsconfig.json eslint.config.js vite.config.ts
git commit -m "chore: upgrade tooling — typescript v6, eslint v10, vite v8, vitest v4"
```

---

## Wave 2 — Tailwind v4

**Packages:** `tailwindcss` v3→v4, `@tailwindcss/vite` (new), `tailwindcss-animate` (check), `prettier-plugin-tailwindcss` v0.6→v0.7, `tailwind-variants` v0.3→v3

### Task 4: Install Tailwind v4 packages and run the codemigrator

**Files:**
- Delete: `tailwind.config.ts`
- Modify: `src/app.css`, `postcss.config.js`, `package.json`

- [ ] **Step 1: Check tailwindcss-animate v4 compatibility**

Use context7: resolve library ID `tailwindcss-animate`, query: `Tailwind CSS v4 compatibility plugin API`

If `tailwindcss-animate` does not support Tailwind v4's plugin API, install the CSS-only replacement:
```bash
npm uninstall tailwindcss-animate
npm install -D tw-animate-css
```

If it does support v4, keep it installed and skip the replacement.

- [ ] **Step 2: Install Tailwind v4 packages**

```bash
npm install -D "tailwindcss@^4" "@tailwindcss/vite" "prettier-plugin-tailwindcss@^0.7" "tailwind-variants@^3"
```

- [ ] **Step 3: Run the official Tailwind v4 codemigrator**

```bash
npx @tailwindcss/upgrade
```

This will:
- Convert `tailwind.config.ts` config into CSS directives in `src/app.css`
- Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`
- Update `postcss.config.js`
- Potentially delete `tailwind.config.ts`

Follow any interactive prompts.

- [ ] **Step 4: Verify tailwind.config.ts is gone**

```bash
ls tailwind.config.ts 2>&1
```

If it still exists with content, the codemigrator did not complete the migration. Read the file and proceed to Task 5 to migrate manually.

---

### Task 5: Verify and finalize src/app.css for Tailwind v4

**Files:**
- Modify: `src/app.css`, `vite.config.ts`, `postcss.config.js`

- [ ] **Step 1: Read src/app.css**

Read `src/app.css` in full after the codemigrator ran.

- [ ] **Step 2: Switch to the @tailwindcss/vite plugin instead of PostCSS**

Since this is a Vite project, using `@tailwindcss/vite` is cleaner than PostCSS. Update `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [sveltekit(), tailwindcss()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
```

Then delete `postcss.config.js` (or empty its plugins since Tailwind is now handled by Vite):
```bash
rm postcss.config.js
```

- [ ] **Step 3: Ensure app.css has the correct structure**

`src/app.css` must contain all of the following sections. Verify each is present; add any that are missing.

**Section 1 — Import and dark mode:**
```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));
```

**Section 2 — tw-animate-css (only if tailwindcss-animate was replaced):**
```css
@import "tw-animate-css";
```

**Section 3 — Theme (all Tailwind utility mappings):**
```css
@theme inline {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  --color-discord-50: #eef2ff;
  --color-discord-100: #e0e7ff;
  --color-discord-200: #c7d2fe;
  --color-discord-300: #a5b4fc;
  --color-discord-400: #818cf8;
  --color-discord-500: #5865f2;
  --color-discord-600: #4f46e5;
  --color-discord-700: #4338ca;
  --color-discord-800: #3730a3;
  --color-discord-900: #312e81;
  --color-discord-950: #1e1b4b;

  --radius-xl: calc(var(--radius) + 4px);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-caret-blink: caret-blink 1.25s ease-out infinite;
}
```

**Section 4 — Keyframes:**
```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--bits-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--bits-accordion-content-height); }
  to { height: 0; }
}

@keyframes caret-blink {
  0%, 70%, 100% { opacity: 1; }
  20%, 50% { opacity: 0; }
}
```

**Section 5 — CSS variable values (keep exactly as-is from the original file):**
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71.4% 4.1%;
    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --primary: 220.9 39.3% 11%;
    --primary-foreground: 210 20% 98%;
    --secondary: 220 14.3% 95.9%;
    --secondary-foreground: 220.9 39.3% 11%;
    --accent: 220 14.3% 95.9%;
    --accent-foreground: 220.9 39.3% 11%;
    --destructive: 0 72.2% 50.6%;
    --destructive-foreground: 210 20% 98%;
    --ring: 224 71.4% 4.1%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;
    --muted: 215 27.9% 16.9%;
    --muted-foreground: 217.9 10.6% 64.9%;
    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;
    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;
    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --primary: 210 20% 98%;
    --primary-foreground: 220.9 39.3% 11%;
    --secondary: 215 27.9% 16.9%;
    --secondary-foreground: 210 20% 98%;
    --accent: 215 27.9% 16.9%;
    --accent-foreground: 210 20% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;
    --ring: 216 12.2% 83.9%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

**Section 6 — Base utilities (keep as-is):**
```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 4: Fix tailwind-variants v3 usage**

Use context7: resolve library ID `tailwind-variants`, query: `v3 migration guide breaking changes tv() API compoundVariants`.

The main file using `tv()` is `src/lib/components/ui/button/button.svelte`. Read it and apply any syntax changes per the migration guide. The current `tv()` call:

```ts
export const buttonVariants = tv({
    base: "...",
    variants: {
        variant: { default: "...", destructive: "...", outline: "...", secondary: "...", ghost: "...", link: "..." },
        size: { default: "...", sm: "...", lg: "...", icon: "..." }
    },
    defaultVariants: { variant: "default", size: "default" }
});
```

Search for any other `tv()` usages:
```bash
grep -r "from \"tailwind-variants\"" src/ --include="*.svelte" --include="*.ts" -l
```

Apply v3 changes to each file found.

---

### Task 6: Validate and commit Wave 2

- [ ] **Step 1: Build**

```bash
npm run build 2>&1
```

Expected: build succeeds (pre-existing CRON_SECRET error is acceptable)

- [ ] **Step 2: Type-check**

```bash
npm run check 2>&1
```

- [ ] **Step 3: Start dev server and spot-check styles**

```bash
npm run dev
```

Open `http://localhost:5173` in a browser. Verify: background color, text color, buttons render, dark mode toggle (if accessible). Press Ctrl+C when done.

- [ ] **Step 4: Commit Wave 2**

```bash
git add -A
git commit -m "chore: upgrade to Tailwind CSS v4"
```

---

## Wave 3 — Component Library

**Packages:** `bits-ui` v1→v2, `paneforge` v1.0.0-next.x→v1.0.2, `vaul-svelte` (investigate)

### Task 7: Research bits-ui v2 and install component library packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Fetch bits-ui v2 migration guide**

Use context7: resolve library ID `bits-ui`, query: `v2 migration guide breaking changes component API imports WithElementRef types`

Document the key changes:
- Which imports moved or were renamed
- Whether `WithElementRef`, `WithoutChild`, `WithoutChildrenOrChild` still exist and where
- Any prop name changes in the underlying primitives

- [ ] **Step 2: Fetch shadcn-svelte bits-ui v2 upgrade info**

Use context7: resolve library ID `shadcn-svelte`, query: `bits-ui v2 component update migration CLI add overwrite`

Determine: can we use `npx shadcn-svelte@latest add <component> --overwrite` to regenerate components, or must we patch manually?

- [ ] **Step 3: Investigate vaul-svelte release status**

```bash
npm show vaul-svelte dist-tags
npm show vaul-svelte@latest version
```

Determine the correct version to use:
- If a stable `^1.x.x` is published (not a `-next` pre-release): plan to upgrade to it
- If only `-next` pre-releases exist on the `next` dist-tag: stay on current `1.0.0-next.6`
- If `0.3.2` is the intended stable release: plan to downgrade and update the drawer component

- [ ] **Step 4: Install bits-ui v2 and paneforge stable**

```bash
npm install -D "bits-ui@^2" "paneforge@^1.0.2"
```

If vaul-svelte stable v1.x is available:
```bash
npm install "vaul-svelte@^1"
```

---

### Task 8: Update all shadcn-svelte UI components for bits-ui v2

**Files:**
- Modify: `src/lib/components/ui/**` (44 component categories, ~100+ files)

The 44 component categories: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, checkbox, collapsible, command, context-menu, data-table, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, pagination, popover, progress, radio-group, range-calendar, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip.

- [ ] **Step 1: Attempt CLI regeneration (if shadcn-svelte CLI supports overwrite)**

If the shadcn-svelte CLI supports `--overwrite` (confirmed in Task 7 Step 2), regenerate all components:

```bash
npx shadcn-svelte@latest add accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button calendar card carousel checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input input-otp label menubar pagination popover progress radio-group range-calendar resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toggle toggle-group tooltip --overwrite
```

After running, check git diff to see what changed. Re-apply any custom modifications that were present in the originals.

- [ ] **Step 2: If CLI regeneration is not viable, apply bits-ui v2 API changes manually**

Run svelte-check to see all errors:
```bash
npm run check 2>&1 | head -300
```

For each error, apply the relevant fix from the migration guide documented in Task 7 Step 1. Common patterns:
- Update import paths for reorganised exports
- Rename `WithElementRef` / `WithoutChild` / `WithoutChildrenOrChild` types if moved
- Update any changed prop names in primitive component wrappers

Work through components in this order (most likely to have API changes first):
dialog, alert-dialog, dropdown-menu, select, popover, command, sheet, tooltip, context-menu, menubar → then the rest

- [ ] **Step 3: Run svelte-check until clean**

```bash
npm run check 2>&1 | head -200
```

Repeat fixing and checking until no errors remain.

---

### Task 9: Validate and commit Wave 3

- [ ] **Step 1: Build**

```bash
npm run build 2>&1
```

- [ ] **Step 2: Type-check clean**

```bash
npm run check 2>&1
```

Expected: 0 errors

- [ ] **Step 3: Lint**

```bash
npm run lint 2>&1
```

- [ ] **Step 4: Commit Wave 3**

```bash
git add -A
git commit -m "chore: upgrade bits-ui v2, regenerate shadcn-svelte components, paneforge stable"
```

---

## Wave 4 — UI Utilities

**Packages:** `mode-watcher` v0→v1, `svelte-sonner` v0→v1, `lucide-svelte` v0→v1, `zod` v3→v4, `@supabase/ssr` v0.5→v0.9, `@supabase/supabase-js` v2.49→v2.100

### Task 10: Install Wave 4 packages and fix mode-watcher + svelte-sonner

**Files:**
- Modify: `package.json`, `src/lib/components/ui/sonner/sonner.svelte`

- [ ] **Step 1: Install Wave 4 packages**

```bash
npm install -D "mode-watcher@^1" "svelte-sonner@^1" "lucide-svelte@^1"
npm install "zod@^4" "@supabase/ssr@^0.9" "@supabase/supabase-js@^2.100"
```

- [ ] **Step 2: Fetch mode-watcher v1 migration guide**

Use context7: resolve library ID `mode-watcher`, query: `v1 migration guide API changes mode store ModeWatcher`

- [ ] **Step 3: Fetch svelte-sonner v1 migration guide**

Use context7: resolve library ID `svelte-sonner`, query: `v1 migration guide API Toaster props theme`

- [ ] **Step 4: Update src/lib/components/ui/sonner/sonner.svelte**

Current file:
```svelte
<script lang="ts">
    import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
    import { mode } from "mode-watcher";

    let restProps: SonnerProps = $props();
</script>

<Sonner
    theme={$mode}
    class="toaster group"
    toastOptions={{
        classes: {
            toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
    }}
    {...restProps}
/>
```

Apply changes per migration guides from Steps 2 and 3:
- Update the `mode-watcher` import and `$mode` usage to v1 API
- Update the `ToasterProps` import and `Toaster` component usage to svelte-sonner v1 API
- The Tailwind classes for toast styling should remain unchanged

---

### Task 11: Fix lucide-svelte v1 imports, Supabase, and zod

**Files:**
- Modify: `src/routes/lobby/new-lobby.svelte`, `src/routes/lobby/lobby-settings.svelte`, `src/routes/lobby/lobby-card.svelte`, `src/routes/lobby/+page.svelte`, `src/routes/commandzone/commander-search.svelte`
- Potentially modify: `src/hooks.server.ts`, any zod schema files

- [ ] **Step 1: Fetch lucide-svelte v1 icon rename list**

Use context7: resolve library ID `lucide-svelte`, query: `v1 migration guide icon renames breaking changes barrel import`

- [ ] **Step 2: Check barrel imports in route files**

These route files use barrel imports (not the individual icon path pattern):
- `src/routes/lobby/new-lobby.svelte`: `import { Plus } from 'lucide-svelte'`
- `src/routes/lobby/lobby-settings.svelte`: `import { Plus } from 'lucide-svelte'`
- `src/routes/lobby/lobby-card.svelte`: `import { Crown } from 'lucide-svelte'`
- `src/routes/lobby/+page.svelte`: `import { Plus, Scroll, Settings } from 'lucide-svelte'`
- `src/routes/commandzone/commander-search.svelte`: `import { LoaderCircle } from 'lucide-svelte'`

Check each icon name against the v1 rename list. Icons to verify: `Plus`, `Crown`, `Scroll`, `Settings`, `LoaderCircle`.

Update any renamed icons. Also check whether barrel imports still work in v1 or need to switch to individual imports (`lucide-svelte/icons/<name>`).

UI component icons (already using individual import paths, just verify none were renamed):
`arrow-right`, `arrow-left`, `minus`, `chevron-down`, `chevron-right`, `chevron-up`, `chevron-left`, `panel-left`, `x`, `check`, `circle`, `grip-vertical`, `search`, `ellipsis`

- [ ] **Step 3: Fetch @supabase/ssr migration guide**

Use context7: resolve library ID `@supabase/ssr`, query: `v0.6 v0.7 v0.8 v0.9 migration breaking changes createServerClient cookies`

- [ ] **Step 4: Check src/hooks.server.ts for Supabase SSR changes**

Current `hooks.server.ts` uses `createServerClient` with `getAll`/`setAll` cookie pattern. Read the file and compare against the migration guide. The `getAll`/`setAll` pattern was introduced in `@supabase/ssr` v0.4, so it may already be compatible. Apply any changes needed.

- [ ] **Step 5: Check zod usage and apply v4 changes if needed**

```bash
grep -r "from \"zod\"" src/ --include="*.ts" --include="*.svelte" -l
```

If any files import from zod: fetch migration guide via context7 (resolve `zod`, query `v4 migration guide breaking changes schema API`) and apply changes.

If no files import zod: this step is done.

---

### Task 12: Validate and commit Wave 4

- [ ] **Step 1: Build**

```bash
npm run build 2>&1
```

- [ ] **Step 2: Type-check**

```bash
npm run check 2>&1
```

- [ ] **Step 3: Commit Wave 4**

```bash
git add -A
git commit -m "chore: upgrade mode-watcher v1, svelte-sonner v1, lucide-svelte v1, supabase"
```

---

## Wave 5 — Adapters

**Packages:** `@sveltejs/adapter-auto` v4→v7, `@sveltejs/vite-plugin-svelte` v5→v7 (if not already done in Wave 1)

### Task 13: Install adapter packages and fetch migration guides

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Check if @sveltejs/vite-plugin-svelte was already upgraded**

```bash
npm show @sveltejs/vite-plugin-svelte version
```

If version is already `7.x.x` (upgraded in Wave 1): skip the vite-plugin-svelte steps in this wave.

- [ ] **Step 2: Fetch @sveltejs/adapter-auto v7 migration guide**

Use context7: resolve library ID `@sveltejs/adapter-auto`, query: `v7 migration guide breaking changes Vercel deployment`

- [ ] **Step 3: Fetch @sveltejs/vite-plugin-svelte v7 migration guide (if not already upgraded)**

Use context7: resolve library ID `@sveltejs/vite-plugin-svelte`, query: `v7 migration guide breaking changes vitePreprocess svelte.config`

- [ ] **Step 4: Install**

```bash
npm install -D "@sveltejs/adapter-auto@^7"
```

If not already upgraded in Wave 1:
```bash
npm install -D "@sveltejs/vite-plugin-svelte@^7"
```

---

### Task 14: Fix svelte.config.js

**Files:**
- Modify: `svelte.config.js`

- [ ] **Step 1: Read svelte.config.js**

Current file:
```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter()
    }
};

export default config;
```

- [ ] **Step 2: Apply changes from migration guides (Task 13 Steps 2-3)**

The `adapter()` call and `vitePreprocess()` import are the two integration points. Update per migration guides. Verify Vercel auto-detection still works (adapter-auto uses environment variable detection; `VERCEL` env var triggers the Vercel adapter).

- [ ] **Step 3: Verify vercel.json is still valid**

```bash
cat vercel.json
```

Check that the cron job config and any routing config still aligns with adapter-auto v7's expectations.

---

### Task 15: Final validation and commit Wave 5

- [ ] **Step 1: Full build**

```bash
npm run build 2>&1
```

- [ ] **Step 2: Type-check**

```bash
npm run check 2>&1
```

Expected: 0 errors

- [ ] **Step 3: Lint**

```bash
npm run lint 2>&1
```

- [ ] **Step 4: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify: app loads, components render, dark mode works, no console errors. Press Ctrl+C.

- [ ] **Step 5: Commit Wave 5**

```bash
git add -A
git commit -m "chore: upgrade @sveltejs/adapter-auto v7, @sveltejs/vite-plugin-svelte v7"
```

---

## Files Modified by Wave

| File | Wave |
|------|------|
| `package.json` / `package-lock.json` | 1, 2, 3, 4, 5 |
| `tsconfig.json` | 1 (if TS v6 changes needed) |
| `eslint.config.js` | 1 |
| `vite.config.ts` | 1, 2 |
| `tailwind.config.ts` | 2 (deleted) |
| `postcss.config.js` | 2 (deleted) |
| `src/app.css` | 2 |
| `src/lib/components/ui/**` | 3 (~100+ files) |
| `src/routes/lobby/new-lobby.svelte` | 4 |
| `src/routes/lobby/lobby-settings.svelte` | 4 |
| `src/routes/lobby/lobby-card.svelte` | 4 |
| `src/routes/lobby/+page.svelte` | 4 |
| `src/routes/commandzone/commander-search.svelte` | 4 |
| `src/lib/components/ui/sonner/sonner.svelte` | 4 |
| `src/hooks.server.ts` | 4 (if Supabase SSR changes needed) |
| `svelte.config.js` | 5 |
