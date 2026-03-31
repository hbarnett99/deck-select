# Lobby Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full lobby create/join/ready-up flow with Supabase Realtime, turning the current stub into a working feature.

**Architecture:** `/lobby` list page uses server load + create action; `/lobby/[id]` detail page auto-joins the current user, exposes ready/leave server actions, and subscribes to two Realtime channels (`lobby_players` and `lobbies`) to patch client state live. A thin `/api/user/[id]` endpoint resolves Discord metadata for players who join after initial load.

**Tech Stack:** SvelteKit (Svelte 5 Runes), sveltekit-superforms 2.x + Zod v4 (`zod4`/`zod4Client` adapters), shadcn-svelte, Supabase Realtime, TypeScript.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `src/lib/schemas/lobby.ts` | **Create** | `CreateLobbySchema` (name, pool_id, practice_mode) |
| `src/routes/lobby/+page.server.ts` | **Create** | load lobbies + pools; `create` action |
| `src/routes/lobby/+page.svelte` | **Rewrite** | Lobby list + "New Lobby" button |
| `src/routes/lobby/new-lobby.svelte` | **Rewrite** | Dialog with superforms (name, pool, practice_mode) |
| `src/routes/lobby/lobby-card.svelte` | **Rewrite** | Real data: name, pool name, player count, badges |
| `src/routes/lobby/[id]/+page.server.ts` | **Create** | load (auto-join) + `ready` + `leave` actions |
| `src/routes/lobby/[id]/+page.svelte` | **Create** | Lobby detail with Realtime subscriptions |
| `src/routes/api/user/[id]/+server.ts` | **Create** | GET Discord metadata via service role |
| `src/routes/lobby/player-card.svelte` | **Delete** | Stub with no value |
| `src/routes/lobby/lobby-settings.svelte` | **Delete** | Stub with no value |

---

## Task 1: `CreateLobbySchema` + unit tests

**Files:**
- Create: `src/lib/schemas/lobby.ts`
- Create: `src/lib/schemas/lobby.test.ts`

- [ ] **Step 1: Write `lobby.ts`**

```typescript
// src/lib/schemas/lobby.ts
import { z } from 'zod';

export const CreateLobbySchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name must be 50 characters or less')
		.trim(),
	pool_id: z.string().uuid('Pool is required'),
	practice_mode: z.boolean().default(false)
});
```

- [ ] **Step 2: Write `lobby.test.ts`**

```typescript
// src/lib/schemas/lobby.test.ts
import { describe, it, expect } from 'vitest';
import { CreateLobbySchema } from './lobby';

describe('CreateLobbySchema', () => {
	it('accepts valid input', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'Friday Night',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(true);
	});

	it('trims the name', () => {
		const result = CreateLobbySchema.safeParse({
			name: '  Trim Me  ',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.name).toBe('Trim Me');
	});

	it('rejects empty name', () => {
		const result = CreateLobbySchema.safeParse({
			name: '',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 50 characters', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'a'.repeat(51),
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid pool_id', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'Test',
			pool_id: 'not-a-uuid',
			practice_mode: false
		});
		expect(result.success).toBe(false);
	});

	it('defaults practice_mode to false', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'Test',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.practice_mode).toBe(false);
	});
});
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- src/lib/schemas/lobby.test.ts
```

Expected: 6 passing

- [ ] **Step 4: Commit**

```bash
git add src/lib/schemas/lobby.ts src/lib/schemas/lobby.test.ts
git commit -m "feat: add CreateLobbySchema with tests"
```

---

## Task 2: `/lobby` server — load + create action

**Files:**
- Create: `src/routes/lobby/+page.server.ts`

- [ ] **Step 1: Write `+page.server.ts`**

```typescript
// src/routes/lobby/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { CreateLobbySchema } from '$lib/schemas/lobby';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [lobbiesResult, poolsResult, form] = await Promise.all([
		supabase
			.from('lobbies')
			.select('id, name, practice_mode, status, pools(name), lobby_players(count)')
			.eq('status', 'waiting')
			.order('created_at', { ascending: false }),
		supabase
			.from('pools')
			.select('id, name')
			.order('name', { ascending: true }),
		superValidate(zod4(CreateLobbySchema))
	]);

	if (lobbiesResult.error) console.error('lobbies load error:', lobbiesResult.error.message);
	if (poolsResult.error) console.error('pools load error:', poolsResult.error.message);

	return {
		lobbies: lobbiesResult.data ?? [],
		pools: poolsResult.data ?? [],
		form
	};
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, user } }) => {
		const form = await superValidate(request, zod4(CreateLobbySchema));
		if (!form.valid) return fail(400, { form });
		if (!user) return fail(401, { form });

		const { data: lobby, error: lobbyError } = await supabase
			.from('lobbies')
			.insert({
				name: form.data.name,
				pool_id: form.data.pool_id,
				practice_mode: form.data.practice_mode,
				admin_id: user.id,
				status: 'waiting'
			})
			.select('id')
			.single();

		if (lobbyError) {
			console.error('create lobby error:', lobbyError.message);
			return fail(500, { form });
		}

		const { error: playerError } = await supabase.from('lobby_players').insert({
			lobby_id: lobby.id,
			user_id: user.id,
			is_ready: false
		});

		if (playerError) {
			console.error('insert creator into lobby_players error:', playerError.message);
			return fail(500, { form });
		}

		redirect(303, `/lobby/${lobby.id}`);
	}
};
```

- [ ] **Step 2: Verify TypeScript**

```bash
npm run check 2>&1 | head -30
```

Expected: no errors in `src/routes/lobby/+page.server.ts`

- [ ] **Step 3: Commit**

```bash
git add src/routes/lobby/+page.server.ts
git commit -m "feat: add /lobby server load and create action"
```

---

## Task 3: `lobby-card.svelte` + `new-lobby.svelte` + `/lobby` page rewrite

**Files:**
- Rewrite: `src/routes/lobby/lobby-card.svelte`
- Rewrite: `src/routes/lobby/new-lobby.svelte`
- Rewrite: `src/routes/lobby/+page.svelte`
- Delete: `src/routes/lobby/player-card.svelte`
- Delete: `src/routes/lobby/lobby-settings.svelte`

- [ ] **Step 1: Delete stub files**

```bash
rm src/routes/lobby/player-card.svelte
rm src/routes/lobby/lobby-settings.svelte
```

- [ ] **Step 2: Rewrite `lobby-card.svelte`**

```svelte
<!-- src/routes/lobby/lobby-card.svelte -->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let {
		lobby
	}: {
		lobby: {
			id: string;
			name: string;
			practice_mode: boolean;
			status: string;
			pools: { name: string } | null;
			lobby_players: { count: number }[];
		};
	} = $props();

	const playerCount = $derived(lobby.lobby_players?.[0]?.count ?? 0);
</script>

<a href="/lobby/{lobby.id}" class="block">
	<Card.Root class="hover:bg-muted/50 cursor-pointer transition-colors">
		<Card.Content class="flex items-center justify-between p-4">
			<div class="flex flex-col gap-1">
				<span class="font-medium">{lobby.name}</span>
				<span class="text-muted-foreground text-sm">{lobby.pools?.name ?? '—'}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground text-sm">{playerCount} players</span>
				{#if lobby.practice_mode}
					<Badge variant="secondary">Practice</Badge>
				{/if}
				<Badge>{lobby.status}</Badge>
			</div>
		</Card.Content>
	</Card.Root>
</a>
```

- [ ] **Step 3: Rewrite `new-lobby.svelte`**

The pool dropdown uses a `<Select>` from shadcn-svelte. Because superforms tracks the `$form` store — not the DOM — we must sync the selected value to `$form.pool_id` via a `$effect`, same pattern as commander-search.

```svelte
<!-- src/routes/lobby/new-lobby.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { superForm, type SuperValidated, type Infer, type SuperForm } from 'sveltekit-superforms';
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
	import { CreateLobbySchema } from '$lib/schemas/lobby';
	import { untrack } from 'svelte';

	let {
		data,
		pools,
		open = $bindable(false)
	}: {
		data: SuperValidated<Infer<typeof CreateLobbySchema>>;
		pools: { id: string; name: string }[];
		open?: boolean;
	} = $props();

	const sf = untrack(() =>
		superForm(data, {
			validators: zodClient(CreateLobbySchema),
			onResult: ({ result }) => {
				if (result.type === 'redirect') open = false;
			}
		})
	);

	const { form, enhance, submitting } = sf;
	const fForm = sf as unknown as SuperForm<Record<string, unknown>>;

	let selectedPoolId = $state<string>('');

	$effect(() => {
		$form.pool_id = selectedPoolId;
	});

	const selectedPoolLabel = $derived(
		pools.find((p) => p.id === selectedPoolId)?.name ?? 'Select a pool'
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>New Lobby</Dialog.Title>
			<Dialog.Description>Create a lobby to start a game.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance class="space-y-4">
			<Form.Field form={fForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$form.name} placeholder="e.g. Friday Night" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={fForm} name="pool_id">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Pool</Form.Label>
						<input type="hidden" name="pool_id" value={selectedPoolId} />
						<Select.Root bind:value={selectedPoolId}>
							<Select.Trigger {...props}>
								{selectedPoolLabel}
							</Select.Trigger>
							<Select.Content>
								{#each pools as pool (pool.id)}
									<Select.Item value={pool.id}>{pool.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex items-center gap-3">
				<Switch bind:checked={$form.practice_mode} name="practice_mode" id="practice_mode" />
				<Label for="practice_mode">Practice mode (no stats recorded)</Label>
			</div>

			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Creating…' : 'Create Lobby'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
```

- [ ] **Step 4: Rewrite `/lobby/+page.svelte`**

```svelte
<!-- src/routes/lobby/+page.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import LobbyCard from './lobby-card.svelte';
	import NewLobby from './new-lobby.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let newLobbyOpen = $state(false);
</script>

<div class="w-full max-w-2xl">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Lobbies</h1>
		<Button onclick={() => (newLobbyOpen = true)}>
			<Plus class="mr-2 h-4 w-4" />
			New Lobby
		</Button>
	</div>

	{#if data.lobbies.length === 0}
		<p class="text-muted-foreground py-12 text-center">
			No open lobbies — create one to get started.
		</p>
	{:else}
		<div class="space-y-2">
			{#each data.lobbies as lobby (lobby.id)}
				<LobbyCard {lobby} />
			{/each}
		</div>
	{/if}
</div>

<NewLobby data={data.form} pools={data.pools} bind:open={newLobbyOpen} />
```

- [ ] **Step 5: Check TypeScript**

```bash
npm run check 2>&1 | head -30
```

Expected: no errors in lobby files

- [ ] **Step 6: Commit**

```bash
git add src/routes/lobby/+page.svelte src/routes/lobby/lobby-card.svelte src/routes/lobby/new-lobby.svelte
git commit -m "feat: rewrite /lobby list page, lobby-card, and new-lobby dialog"
```

---

## Task 4: `/api/user/[id]` — Discord metadata endpoint

**Files:**
- Create: `src/routes/api/user/[id]/+server.ts`

This endpoint uses the **service role client** (not the anon client from `locals.supabase`) to read `auth.users` metadata. It must stay in a `.server.ts` file. The service role key is available via `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 1: Write `+server.ts`**

```typescript
// src/routes/api/user/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	const serviceClient = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const { data, error: rpcError } = await serviceClient.auth.admin.getUserById(id);

	if (rpcError || !data.user) {
		throw error(404, 'User not found');
	}

	const meta = data.user.user_metadata ?? {};
	return json({
		username: (meta.global_name ?? meta.full_name ?? 'Unknown') as string,
		avatar_url: (meta.avatar_url ?? null) as string | null
	});
};
```

- [ ] **Step 2: Verify TypeScript**

```bash
npm run check 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/routes/api/user/[id]/+server.ts
git commit -m "feat: add /api/user/[id] Discord metadata endpoint"
```

---

## Task 5: `/lobby/[id]` server — load (auto-join) + ready + leave actions

**Files:**
- Create: `src/routes/lobby/[id]/+page.server.ts`

The load function reads Discord metadata via the service role client for all initial players. Auto-join inserts the current user if not already in `lobby_players` (upsert on conflict do nothing). The `ready` action flips `is_ready`. The `leave` action deletes the user row then resets all remaining players' `is_ready` to false.

- [ ] **Step 1: Write `+page.server.ts`**

```typescript
// src/routes/lobby/[id]/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

function serviceClient() {
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});
}

async function discordMeta(userId: string): Promise<{ username: string; avatar_url: string | null }> {
	const { data, error: err } = await serviceClient().auth.admin.getUserById(userId);
	if (err || !data.user) return { username: 'Unknown', avatar_url: null };
	const meta = data.user.user_metadata ?? {};
	return {
		username: (meta.global_name ?? meta.full_name ?? 'Unknown') as string,
		avatar_url: (meta.avatar_url ?? null) as string | null
	};
}

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	if (!user) redirect(303, '/auth');

	const { id } = params;

	// Fetch lobby
	const { data: lobby, error: lobbyError } = await supabase
		.from('lobbies')
		.select('id, name, practice_mode, status, admin_id, pools(name)')
		.eq('id', id)
		.single();

	if (lobbyError || !lobby) throw error(404, 'Lobby not found');

	// Auto-join: insert current user if not already a player (conflict = do nothing)
	await supabase.from('lobby_players').upsert(
		{ lobby_id: id, user_id: user.id, is_ready: false },
		{ onConflict: 'lobby_id,user_id', ignoreDuplicates: true }
	);

	// Fetch all players after potential insert
	const { data: playerRows } = await supabase
		.from('lobby_players')
		.select('id, user_id, is_ready, commander_id, joined_at')
		.eq('lobby_id', id)
		.order('joined_at', { ascending: true });

	// Resolve Discord metadata in parallel
	const players = await Promise.all(
		(playerRows ?? []).map(async (p) => {
			const meta = await discordMeta(p.user_id);
			return { ...p, ...meta };
		})
	);

	return {
		lobby,
		players,
		isAdmin: lobby.admin_id === user.id,
		currentUserId: user.id
	};
};

export const actions: Actions = {
	ready: async ({ params, locals: { supabase, user } }) => {
		if (!user) return fail(401);
		const { id } = params;

		// Fetch current is_ready
		const { data: row } = await supabase
			.from('lobby_players')
			.select('is_ready')
			.eq('lobby_id', id)
			.eq('user_id', user.id)
			.single();

		if (!row) return fail(404);

		const { error: updateError } = await supabase
			.from('lobby_players')
			.update({ is_ready: !row.is_ready })
			.eq('lobby_id', id)
			.eq('user_id', user.id);

		if (updateError) {
			console.error('ready toggle error:', updateError.message);
			return fail(500);
		}

		return { success: true };
	},

	leave: async ({ params, locals: { supabase, user } }) => {
		if (!user) return fail(401);
		const { id } = params;

		// Delete current user from lobby
		const { error: deleteError } = await supabase
			.from('lobby_players')
			.delete()
			.eq('lobby_id', id)
			.eq('user_id', user.id);

		if (deleteError) {
			console.error('leave error:', deleteError.message);
			return fail(500);
		}

		// Reset remaining players' ready status
		await supabase
			.from('lobby_players')
			.update({ is_ready: false })
			.eq('lobby_id', id);

		redirect(303, '/lobby');
	}
};
```

- [ ] **Step 2: Verify TypeScript**

```bash
npm run check 2>&1 | head -30
```

Expected: no errors in lobby/[id] server file

- [ ] **Step 3: Commit**

```bash
git add src/routes/lobby/[id]/+page.server.ts
git commit -m "feat: add /lobby/[id] server with auto-join, ready, and leave actions"
```

---

## Task 6: `/lobby/[id]` page with Realtime

**Files:**
- Create: `src/routes/lobby/[id]/+page.svelte`

Two Realtime channels, set up in `$effect`, torn down on return:
- **`lobby_players`** (INSERT/UPDATE/DELETE filtered by `lobby_id`): INSERT fetches Discord metadata from `/api/user/[id]`, UPDATE patches `is_ready`, DELETE removes player (redirect if current user removed).
- **`lobbies`** (UPDATE filtered by `id`): patches `lobby.status`.

`use:enhance` on the ready form prevents full-page reload on toggle.

- [ ] **Step 1: Write `+page.svelte`**

```svelte
<!-- src/routes/lobby/[id]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Crown, LogOut } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Mutable state — patched by Realtime
	let players = $state(data.players);
	let lobby = $state(data.lobby);

	const sortedPlayers = $derived(
		[...players].sort((a, b) => {
			// Admin always first
			const aAdmin = a.user_id === lobby.admin_id ? 0 : 1;
			const bAdmin = b.user_id === lobby.admin_id ? 0 : 1;
			return aAdmin - bAdmin;
		})
	);

	const allReady = $derived(players.length > 0 && players.every((p) => p.is_ready));

	$effect(() => {
		const supabase = data.supabase;

		// Channel 1 — lobby_players
		const playersChannel = supabase
			.channel(`lobby-players-${data.lobby.id}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'lobby_players',
					filter: `lobby_id=eq.${data.lobby.id}`
				},
				async (payload) => {
					const newRow = payload.new as { id: string; user_id: string; is_ready: boolean; commander_id: string | null; joined_at: string };
					// Fetch Discord metadata
					const res = await fetch(`/api/user/${newRow.user_id}`);
					const meta = res.ok ? await res.json() : { username: 'Unknown', avatar_url: null };
					players = [...players, { ...newRow, ...meta }];
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'lobby_players',
					filter: `lobby_id=eq.${data.lobby.id}`
				},
				(payload) => {
					const updated = payload.new as { user_id: string; is_ready: boolean; commander_id: string | null };
					players = players.map((p) =>
						p.user_id === updated.user_id
							? { ...p, is_ready: updated.is_ready, commander_id: updated.commander_id }
							: p
					);
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'lobby_players',
					filter: `lobby_id=eq.${data.lobby.id}`
				},
				(payload) => {
					const deleted = payload.old as { user_id: string };
					if (deleted.user_id === data.currentUserId) {
						goto('/lobby');
						return;
					}
					players = players.filter((p) => p.user_id !== deleted.user_id);
				}
			)
			.subscribe();

		// Channel 2 — lobbies
		const lobbyChannel = supabase
			.channel(`lobby-${data.lobby.id}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'lobbies',
					filter: `id=eq.${data.lobby.id}`
				},
				(payload) => {
					const updated = payload.new as { status: string };
					lobby = { ...lobby, status: updated.status };
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(playersChannel);
			supabase.removeChannel(lobbyChannel);
		};
	});
</script>

<div class="w-full max-w-2xl">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">{lobby.name}</h1>
			<p class="text-muted-foreground text-sm">
				{lobby.pools?.name ?? '—'}
				{#if lobby.practice_mode}
					<Badge variant="secondary" class="ml-2">Practice</Badge>
				{/if}
			</p>
		</div>
		<form method="POST" action="?/leave" use:enhance>
			<Button variant="outline" type="submit">
				<LogOut class="mr-2 h-4 w-4" />
				Leave
			</Button>
		</form>
	</div>

	<!-- Player list -->
	<div class="space-y-2">
		{#each sortedPlayers as player (player.user_id)}
			<div class="flex items-center justify-between rounded-lg border p-3">
				<div class="flex items-center gap-3">
					<Avatar.Root class="h-9 w-9">
						<Avatar.Image src={player.avatar_url} alt={player.username} />
						<Avatar.Fallback>{player.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
					</Avatar.Root>
					<span class="font-medium">{player.username}</span>
					{#if player.user_id === lobby.admin_id}
						<Crown class="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
					{/if}
				</div>
				<Badge variant={player.is_ready ? 'default' : 'secondary'}>
					{player.is_ready ? 'Ready' : 'Not Ready'}
				</Badge>
			</div>
		{/each}

		{#if players.length <= 1}
			<p class="text-muted-foreground py-8 text-center text-sm italic">
				Waiting for others to join…
			</p>
		{/if}
	</div>

	<!-- Actions -->
	<div class="mt-6 flex items-center justify-between">
		<form method="POST" action="?/ready" use:enhance>
			{#each players.filter((p) => p.user_id === data.currentUserId) as me}
				<Button type="submit" variant={me.is_ready ? 'outline' : 'default'}>
					{me.is_ready ? 'Unready' : 'Ready Up'}
				</Button>
			{/each}
		</form>

		{#if data.isAdmin}
			<Button disabled={!allReady} variant="default">
				Draw (Step 5)
			</Button>
		{/if}
	</div>
</div>
```

- [ ] **Step 2: Wire up `data.supabase` — check the layout load**

The `data.supabase` client must come from the root layout. Check that `src/routes/+layout.server.ts` returns `{ session, supabase: ... }` and that `src/routes/+layout.svelte` passes it down.

Read `src/routes/+layout.server.ts` — if it already returns `supabase`, nothing to do. If not, it needs to be added.

Expected: the root layout already returns `supabase` from `locals.supabase` (standard Supabase SvelteKit pattern). If missing, add:

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { session, user, supabase } }) => {
	return { session, supabase };
};
```

- [ ] **Step 3: Verify TypeScript**

```bash
npm run check 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/routes/lobby/[id]/+page.svelte
git commit -m "feat: add /lobby/[id] page with Realtime subscriptions"
```

---

## Task 7: End-to-end smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manual test — lobby list**
  - Navigate to `/lobby`
  - Verify page loads with "Lobbies" header and "New Lobby" button
  - If no lobbies exist, verify empty state message appears
  - Click "New Lobby" — dialog opens with Name field, Pool dropdown, Practice mode switch

- [ ] **Step 3: Manual test — create lobby**
  - Enter a name, select a pool, leave practice mode off, submit
  - Verify redirect to `/lobby/[newId]`
  - Verify your user appears in the player list with "Not Ready" badge

- [ ] **Step 4: Manual test — ready toggle**
  - Click "Ready Up" — badge changes to "Ready", button text changes to "Unready"
  - Click "Unready" — badge returns to "Not Ready"

- [ ] **Step 5: Manual test — leave**
  - Click "Leave" — redirects to `/lobby`
  - Lobby still appears in list (no auto-delete)

- [ ] **Step 6: Manual test — Realtime (two browser sessions)**
  - Open the lobby detail in two browser sessions
  - Ready up in one — verify the other session updates without reload
  - Leave in one — verify the other session removes the player row

- [ ] **Step 7: Commit**

```bash
git add -u
git commit -m "feat: lobby features complete — list, create, detail, ready, leave, Realtime"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `/lobby` load: `waiting` lobbies, joined `pools(name)` and `lobby_players(count)` ✅
- [x] `/lobby` `create` action: validates schema, inserts lobby + creator player, redirects ✅
- [x] `/lobby/[id]` load: 404 if not found, auto-join, Discord metadata from service role ✅
- [x] `/lobby/[id]` `ready` action: flips `is_ready` ✅
- [x] `/lobby/[id]` `leave` action: deletes player, resets remaining, redirects ✅
- [x] `/api/user/[id]`: service role, returns `username` + `avatar_url` ✅
- [x] Realtime `lobby_players` INSERT/UPDATE/DELETE ✅
- [x] Realtime `lobbies` UPDATE ✅
- [x] Admin sorted first ✅
- [x] Draw button: admin-only, disabled until all ready, no action (Step 5) ✅
- [x] Empty state (1 player) ✅
- [x] Practice mode badge ✅
- [x] `player-card.svelte` and `lobby-settings.svelte` deleted ✅

**Placeholder scan:** None — all code blocks are complete.

**Type consistency:**
- `lobby.pools` is `{ name: string } | null` — matches select shape `pools(name)`.
- `lobby_players(count)` returns `[{ count: number }]` — accessed as `lobby.lobby_players?.[0]?.count`.
- `players` state shape: `{ id, user_id, is_ready, commander_id, joined_at, username, avatar_url }`.
