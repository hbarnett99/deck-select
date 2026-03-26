# CLAUDE.md — deck-select-2

## Project Overview

A web app for a friend group that regularly builds $50 Magic: The Gathering Commander decks. Whitelisted users build shared **Pools** of commanders. In a lobby, each player is randomly assigned a unique commander from the lobby's chosen Pool. The app tracks every claim (win/loss/draw, deck value, Moxfield URL) and rolls those up into global commander statistics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit (Svelte 5 with Runes) |
| Styling | Tailwind CSS + shadcn-svelte |
| Auth | Supabase Auth — Discord OAuth only |
| Database | Supabase (Postgres + RLS + Realtime) |
| Deployment | Vercel (`@sveltejs/adapter-auto`) |
| Validation | Zod (all form inputs) |
| Forms | sveltekit-superforms + formsnap |

---

## Environment Variables

```
# .env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

PUBLIC_SITE_URL=          # e.g. https://deck-select.vercel.app (prod) | http://localhost:5173 (dev)
```

`PUBLIC_SITE_URL` drives all OAuth redirect URLs — never hardcode `localhost` in auth logic. The existing `oauth.util.ts` redirectTo should reference this variable.

---

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run check        # svelte-check + tsc
npm run lint         # prettier + eslint
npm run test         # vitest (unit)
```

---

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   └── ui/              # shadcn-svelte primitives (Button, Card, etc.)
│   ├── utils/
│   │   └── oauth.util.ts    # OAuth provider map
│   └── types/               # Shared Zod schemas + inferred TS types
├── routes/
│   ├── auth/
│   │   ├── callback/        # Supabase auth callback handler
│   │   └── error/           # Auth error page
│   ├── (app)/               # Protected layout group (requires whitelist)
│   │   ├── +layout.server.ts
│   │   ├── lobby/
│   │   │   ├── +page.svelte          # Lobby list / create lobby
│   │   │   └── [id]/
│   │   │       └── +page.svelte      # Active lobby (ready-up, draw, reveal)
│   │   ├── pools/
│   │   │   ├── +page.svelte          # Pool list
│   │   │   └── [id]/
│   │   │       └── +page.svelte      # Pool detail + add/remove commanders
│   │   ├── commanders/
│   │   │   └── +page.svelte          # Commander list + global stats
│   │   └── profile/
│   │       └── +page.svelte          # User's claim history + personal stats
│   └── +page.svelte                  # Login page (Discord OAuth)
└── hooks.server.ts                   # Session hydration + whitelist gate
```

---

## Database Schema

All tables live in Supabase. Enable RLS on every table.

### `whitelisted_users`
| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | unique |
| `created_at` | `timestamptz` | |

### `commanders`
| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | |
| `name` | `text` | unique, the commander's full card name |
| `created_by` | `uuid` FK → `auth.users` | |
| `created_at` | `timestamptz` | |

### `pools`
| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | |
| `name` | `text` | |
| `created_by` | `uuid` FK → `auth.users` | |
| `created_at` | `timestamptz` | |

### `pool_commanders` (junction)
| column | type | notes |
|---|---|---|
| `pool_id` | `uuid` FK → `pools` | PK composite |
| `commander_id` | `uuid` FK → `commanders` | PK composite |
| `added_by` | `uuid` FK → `auth.users` | |
| `added_at` | `timestamptz` | |

### `lobbies`
| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | |
| `name` | `text` | |
| `pool_id` | `uuid` FK → `pools` | selected at creation |
| `admin_id` | `uuid` FK → `auth.users` | first user to create |
| `practice_mode` | `boolean` | default `false`; claims not recorded when true |
| `status` | `text` | `waiting` \| `drawing` \| `complete` |
| `created_at` | `timestamptz` | |

### `lobby_players`
| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | |
| `lobby_id` | `uuid` FK → `lobbies` | |
| `user_id` | `uuid` FK → `auth.users` | |
| `is_ready` | `boolean` | default `false` |
| `commander_id` | `uuid` FK → `commanders` | null until drawn |
| `joined_at` | `timestamptz` | |

### `claims`
Per-user, per-commander record created after each non-practice draw.

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | |
| `lobby_id` | `uuid` FK → `lobbies` | |
| `user_id` | `uuid` FK → `auth.users` | |
| `commander_id` | `uuid` FK → `commanders` | |
| `moxfield_url` | `text` | nullable; can be added retrospectively |
| `deck_value_usd` | `numeric(8,2)` | nullable |
| `result` | `text` | `win` \| `loss` \| `draw` \| null (pending) |
| `created_at` | `timestamptz` | |

### Global stats (view or materialised)
Derive these from `claims` rather than storing separately:
- times a commander has been claimed
- win/loss/draw record per commander
- average deck value per commander

Create a Postgres view `commander_stats` that aggregates `claims` — do not duplicate data in a separate table.

---

## Authentication & Whitelist

- Discord is the **only** OAuth provider.
- After OAuth callback, check `whitelisted_users` table for the user's `user_id`.
- Gate in **both** `hooks.server.ts` (redirect non-whitelisted to `/auth/error`) **and** RLS policies on all `(app)` tables.
- The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side for whitelist checks and admin operations — never expose it to the client.

### OAuth redirect URL
```typescript
// oauth.util.ts — use env var, not hardcoded localhost
redirectTo: `${PUBLIC_SITE_URL}/auth/callback`
```

---

## Coding Conventions

### Svelte 5 — Runes only
- Use `$state`, `$derived`, `$effect`, `$props` — never `let` reactive declarations or `$:`.
- Use `$derived.by(...)` for complex derivations.

### SvelteKit patterns
- Prefer **server actions** (`+page.server.ts`) over client-side `fetch` for mutations.
- Use `+page.server.ts` `load` functions for initial data; use Supabase Realtime only for live updates (lobby state, ready status, card reveal).
- All server-only secrets must stay in `.server.ts` files.

### TypeScript
- Always TypeScript — no `.js` files.
- Infer types from Zod schemas using `z.infer<typeof Schema>`.
- Use Supabase generated types (`supabase gen types typescript`) in `src/lib/types/database.types.ts`.

### Forms
- All forms use **sveltekit-superforms** + **formsnap** + **Zod** schema validation.
- No raw `request.formData()` — use superforms' `superValidate`.

### Styling
- Tailwind utility classes only — no custom CSS unless unavoidable.
- Use shadcn-svelte primitives: `Button`, `Card`, `Separator`, `Form`, `Input`, `Dialog`, `Sheet`, `Badge`, `Avatar`.
- Install new shadcn-svelte components with `npx shadcn-svelte@latest add <component>`.

---

## Realtime Subscriptions

Use Supabase Realtime in the lobby route only (`/lobby/[id]`). Subscribe to:

| Table | Event | Purpose |
|---|---|---|
| `lobby_players` | `UPDATE` | Ready status changes |
| `lobby_players` | `UPDATE` | Commander assignment reveal |
| `lobbies` | `UPDATE` | Status transitions (`waiting` → `drawing` → `complete`) |

Set up subscriptions in a Svelte `$effect` and clean up with `channel.unsubscribe()` on destroy.

---

## Card Draw Logic (Server-side)

The draw must happen in a **single server action** (never client-side) to guarantee uniqueness:

1. Fetch all `pool_commanders` for the lobby's pool.
2. Fetch all `lobby_players` for the lobby.
3. Shuffle the commander list (Fisher-Yates).
4. Assign one unique commander to each player (no duplicates).
5. Bulk-update `lobby_players.commander_id`.
6. If `practice_mode = false`, insert one row into `claims` per player.
7. Set `lobbies.status = 'drawing'` — Realtime pushes the reveal to all clients simultaneously.

---

## Feature Status

| Feature | Status |
|---|---|
| Discord OAuth login page | ✅ Done |
| Whitelist enforcement | ⬜ To build |
| Commander CRUD + pool management | ⬜ To build |
| Lobby create / join / ready-up | ⬜ To build |
| Admin controls (practice mode, draw trigger, pool filter) | ⬜ To build |
| Card draw + simultaneous reveal | ⬜ To build |
| Claims recording + retrospective Moxfield/value entry | ⬜ To build |
| `commander_stats` view + stats UI | ⬜ To build |
| User profile / personal history | ⬜ To build |

---

## Known Decisions Pending

- **Whitelist management UI** — how are users added to `whitelisted_users`? (Direct Supabase dashboard, or an admin page in-app?) Decide before building `hooks.server.ts` gate.
- **Supabase migrations** — schema currently only exists in the dashboard. Before adding new tables, export and commit a baseline migration: `supabase db dump --schema public > supabase/migrations/0001_baseline.sql`.
