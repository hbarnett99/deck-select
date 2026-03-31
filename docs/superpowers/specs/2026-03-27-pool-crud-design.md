# Pool CRUD — Design Spec

**Date:** 2026-03-27
**Branch:** feat/pool-crud
**Status:** Approved

---

## Context

Commanders are registered globally but always added in the context of a pool. A pool is a named collection of commanders that a lobby draws from. When a lobby uses multiple pools, the draw uses the distinct union of all selected pools' commanders (future concern — lobbies currently reference a single pool).

---

## Routes & Files

```
src/routes/(app)/
├── commandzone/
│   ├── +page.svelte          ← repurposed: read-only commander stats table
│   └── +page.server.ts       ← load: query commander_stats view
│
├── pools/
│   ├── +page.svelte          ← pool list + "New Pool" button
│   ├── +page.server.ts       ← load: list pools | action: create
│   ├── new-pool.svelte       ← dialog (follows new-lobby.svelte pattern)
│   └── [id]/
│       ├── +page.svelte      ← pool detail: commander list + add/remove
│       ├── +page.server.ts   ← load: pool + commanders | actions: add, remove
│       └── commander-search.svelte  ← moved from commandzone/
```

---

## Server Actions & Data Flow

### `/pools` — `create` action
- Validates: `name` (non-empty, max 50 chars) via Zod + superforms
- Inserts into `pools` with `created_by = user.id`
- On success: redirects to `/pools/[newId]`

### `/pools/[id]` — `add` action
1. Receives `commanderName` from Scryfall search selection
2. Upserts into `commanders`: `INSERT ... ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id` — always returns the id whether inserted or pre-existing
3. Inserts into `pool_commanders (pool_id, commander_id, added_by)`
4. If commander already in pool: returns superforms error ("Already in pool"), shown as toast
5. On success: invalidates page data, dialog closes

### `/pools/[id]` — `remove` action
- Receives `commanderId`
- Deletes from `pool_commanders` where `pool_id = params.id AND commander_id = commanderId`
- Any whitelisted user can remove (matches RLS policy)

### `/commandzone` — load only
- Queries `commander_stats` view ordered by `times_claimed DESC`
- No mutations

### Auth
- All load functions and actions use `event.locals.supabase` (user session client)
- RLS policies on `commanders`, `pool_commanders`, and `pools` enforce whitelist membership

---

## UI & Components

### `/pools` — pool list
- Layout mirrors `/lobby`: pool cards in a scrollable list, "New Pool" button top-right
- Each pool card: name, commander count, created date — navigates to `/pools/[id]` on click
- `new-pool.svelte`: dialog with single name `<Input>` + submit, follows `new-lobby.svelte` pattern

### `/pools/[id]` — pool detail
- Header: pool name + "Add Commander" button → opens `commander-search.svelte` dialog
- Body: scrollable list — each row: commander name + trash icon (remove)
- Empty state: "No commanders yet — add one to get started"
- `commander-search.svelte` moved here unchanged; form action updated to point to `add`

### `/commandzone` — stats table
- shadcn `<Table>` replacing the current search UI
- Columns: Commander | Times Claimed | W / L / D | Avg Deck Value
- Sorted by times claimed descending; "—" for commanders with no claims
- Read-only, no interactions

### Error & Loading States
- Create pool: superforms inline validation
- "Already in pool": toast via sonner
- Commander list: skeleton rows while loading
- Remove: optimistic UI or immediate reload (simple reload is fine for v1)

---

## Out of Scope
- Multi-pool lobby selection (future)
- Pool deletion
- Editing pool name
- Commander deletion from global table
