# Lobby Features — Design Spec

**Date:** 2026-03-30
**Branch:** feat/lobby-features
**Status:** Approved

---

## Context

Lobbies are ephemeral game rooms. A lobby has a name, a pool (the set of commanders to draw from), and a practice mode flag. The creator is the admin. All whitelisted users can see the lobby list and join any waiting lobby. When every player has readied up, the admin can trigger the draw (Step 5 — separate feature). Leaving a lobby resets all remaining players' ready status.

---

## Routes & Files

```
src/routes/lobby/
├── +page.svelte              ← rewrite stub: lobby list + "New Lobby" button
├── +page.server.ts           ← new: load lobbies | action: create
├── new-lobby.svelte          ← rewrite stub: superforms (name, pool_id, practice_mode)
├── lobby-card.svelte         ← rewrite stub: real data (name, pool, player count, status badge)
└── [id]/
    ├── +page.svelte          ← new: lobby detail (players, ready toggle, draw button placeholder)
    └── +page.server.ts       ← new: load + auto-join | actions: ready, leave
```

**Deleted:**
- `src/routes/lobby/player-card.svelte` — stub with no value
- `src/routes/lobby/lobby-settings.svelte` — stub with no value

**New:**
- `src/routes/api/user/[id]/+server.ts` — GET endpoint: fetches Discord metadata for a user ID via service role (used by Realtime to resolve new player info)
- `src/lib/schemas/lobby.ts` — Zod schemas: `CreateLobbySchema`

---

## Server Actions & Data Flow

### `/lobby` — load
- Queries `lobbies` with status `waiting`, ordered by `created_at` desc
- Joins `pools(name)` for display
- Joins `lobby_players(count)` for player count on each card
- Returns `{ lobbies, pools, form }` — pools list populates the "New Lobby" pool dropdown

### `/lobby` — `create` action
- Validates `CreateLobbySchema`: `name` (non-empty, max 50, trimmed), `pool_id` (uuid), `practice_mode` (boolean, default false)
- Inserts into `lobbies` (`admin_id = user.id`, `status = 'waiting'`)
- Inserts creator into `lobby_players` (`user_id = user.id`, `is_ready = false`)
- Redirects to `/lobby/[newId]`

### `/lobby/[id]` — load
- Fetches lobby row; 404 if not found
- Fetches `lobby_players` for this lobby; for each player, reads Discord username + avatar from `auth.users.raw_user_meta_data` via service role client
- **Auto-join**: if current user is not in `lobby_players`, inserts them (`is_ready = false`) before returning
- Returns `{ lobby, players, isAdmin: lobby.admin_id === user.id }`

### `/lobby/[id]` — `ready` action
- Reads current `is_ready` for the user, flips it
- `UPDATE lobby_players SET is_ready = NOT is_ready WHERE lobby_id = id AND user_id = user.id`

### `/lobby/[id]` — `leave` action
- Deletes current user from `lobby_players`
- Resets remaining players: `UPDATE lobby_players SET is_ready = false WHERE lobby_id = id`
- Redirects to `/lobby`

### `/api/user/[id]` — GET
- Uses service role client to read `auth.users` for the given user ID
- Returns `{ username, avatar_url }` from `raw_user_meta_data`
- Used client-side when a Realtime INSERT event brings a new player whose metadata isn't in the initial page data

---

## UI & Components

### `/lobby` — lobby list
- Layout mirrors `/pools`: scrollable card list, "New Lobby" button top-right
- Each `lobby-card.svelte`: lobby name, pool name, player count (`X players`), practice mode badge, status badge
- Only `waiting` lobbies shown — complete lobbies are history, no value browsing them
- Clicking a card navigates to `/lobby/[id]` (auto-join happens in the load)
- `new-lobby.svelte`: dialog with:
  - Name `<Input>`
  - Pool `<Select>` populated from `data.pools`
  - Practice mode `<Switch>`
  - Follows `new-pool.svelte` `$bindable` open prop pattern

### `/lobby/[id]` — lobby detail
- Header: lobby name, pool name, practice mode badge, "Leave" button
- Player list: each row — Discord avatar + username, ready badge (ready / not ready), crown icon for admin
- Admin row always sorted first
- "Ready" toggle button for the current user (form POST to `?/ready`, uses `use:enhance`)
- "Draw" button: visible only when `isAdmin`, disabled until all players `is_ready = true` — wired to Step 5 (draw action not implemented here, button present as placeholder)
- Empty state (only current user): "Waiting for others to join…"

### Realtime (client-side, `$effect` on `/lobby/[id]`)

Two Supabase Realtime channels, set up in `$effect`, torn down on return:

**Channel 1 — `lobby_players`**
- Filter: `lobby_id=eq.[id]`
- Events: INSERT, UPDATE, DELETE
- INSERT: fetch player metadata from `/api/user/[id]`, append to `players` state
- UPDATE: patch `is_ready` on the matching player in `players` state
- DELETE: remove player from `players` state; if current user was removed externally (edge case), redirect to `/lobby`

**Channel 2 — `lobbies`**
- Filter: `id=eq.[id]`
- Event: UPDATE
- Patch `lobby.status` in local state
- When status becomes `drawing`: Step 5 handles the reveal (no action needed here beyond state update)

---

## Discord Metadata

Discord OAuth stores `full_name`, `avatar_url`, and `custom_claims.global_name` in `auth.users.raw_user_meta_data`. The load function reads this via the service role client for all players in the initial load. For players who join after initial load (via Realtime INSERT), the client fetches `/api/user/[id]` to get their metadata.

---

## Error & Edge Cases

- **Lobby not found**: 404 in load
- **Lobby already complete**: load still succeeds; page shows players + commanders (read-only; draw/ready controls hidden)
- **User already in lobby**: auto-join INSERT is a no-op if the row exists (upsert on conflict do nothing)
- **Leave with 1 player**: deletes the only player; lobby remains in `waiting` status (no auto-delete for v1)
- **Admin leaves**: admin can leave; lobby remains but has no admin — draw button disappears. No reassignment for v1.

---

## Out of Scope
- Lobby deletion
- Admin reassignment when admin leaves
- Kicking players
- Lobby capacity limit
- Browsing complete lobbies
